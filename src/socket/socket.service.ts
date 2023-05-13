import { FileService } from './../file/file.service';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Queue } from 'bull';
import { writeFile } from 'fs';
import { resolve } from 'path';
import { Server, Socket } from 'socket.io';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';

enum MsgFileType {
  Text = 'text',
  IMG = 'img',
}

interface MsgType {
  type: MsgFileType.Text | MsgFileType.IMG;
  content: string | Buffer;
  timestamp: string;
}

@Injectable()
export class SocketService {
  constructor(
    private cacheManager: RedisCacheService,
    @InjectQueue('msg') private readonly queue: Queue,

    private fileService: FileService,
  ) {}

  async handleDisconnect(client: Socket) {
    const userId: string = await this.cacheManager.get(client.id);
    console.log(`断开链接,socketId: ${client.id},userId: ${userId}`);
    await this.cacheManager.del(client.id);
    await this.cacheManager.del(userId);
  }

  async afterConnected(data: any, client: Socket) {
    // 收到连接信息,来保存用户的id和会话。
    console.log('connected', data, client.id);
    await this.cacheManager.set(data.userId, client.id);
    await this.cacheManager.set(client.id, data.userId);
    const history = await this.findHistoryMsg(data.userId);
    if (history) {
      await this.sendAllHistoryMsg(client, history, data.userId);
    }
    await this.cacheManager.del(`msg_${data.userId}`);
  }

  async msgService(data: any, client: Socket) {
    const { fromUserId, toUserId, msg, msgType, timestamp } = data;
    console.log(`收到socket消息,type:${msgType}`);
    await this.sendMsg(client, fromUserId, toUserId, msg, timestamp);
  }

  async sendMsg(
    client: Socket,
    fromUserId,
    toUserId,
    msg: MsgType,
    timestamp: string,
  ) {
    const socketId: string = await this.cacheManager.get(toUserId);
    //   如果客户端在线，那么直接发送过去，否则就储存起来，等上线后一次性全部发送。
    if (socketId) {
      this.sendOnlineMsg(client, socketId, fromUserId, msg, timestamp);
    } else {
      this.sendOfflineMsg(
        client,
        socketId,
        fromUserId,
        toUserId,
        msg,
        timestamp,
      );
    }
  }

  async sendOnlineMsg(
    client: Socket,
    socketId,
    fromUserId,
    msg: MsgType,
    timestamp: string,
  ) {
    client.to(socketId).emit('msg', {
      fromUserId,
      msg,
      timestamp,
    });
  }

  async sendOfflineMsg(
    client: Socket,
    socketId,
    fromUserId,
    toUserId,
    msg: MsgType,
    timestamp,
  ) {
    if (msg.type === MsgFileType.Text) {
      console.log('对方离线，消息存入redis中');
      await this.cacheManager.update(toUserId, {
        fromUserId,
        msg,
      });
    } else if (msg.type === MsgFileType.IMG) {
      const imgName = `from_${fromUserId}_to_${toUserId}_${new Date().getTime()}`;
      const filePath = await this.fileService.saveImgToServe(
        msg.content as Buffer,
        imgName,
      );
      if (filePath === '') {
        // 文件保存错误
      } else {
        const new_msg = Object.assign({}, msg, {
          content: filePath,
        });
        await this.cacheManager.update(toUserId, {
          fromUserId,
          msg: new_msg,
        });
      }
    }
  }

  async sendMsgHistory(client: Socket, fromUserId, toUserId, msg: MsgType) {
    const socketId: string = await this.cacheManager.get(toUserId);
    // 客户端上线后发送历史消息。
    const { type, content, timestamp } = msg;
    if (type === MsgFileType.Text) {
      client.emit('msg', {
        fromUserId,
        msg,
      });
    } else {
      const blob = await this.fileService.filePath2Blob(content as string);
      msg.content = blob;
      client.emit('msg', {
        fromUserId,
        msg,
      });
    }
  }

  async sendAllHistoryMsg(client: Socket, history, toUserId) {
    for (const historyItem of history) {
      await this.sendMsgHistory(
        client,
        historyItem.fromUserId,
        toUserId,
        historyItem.msg,
      );
    }
  }

  async findHistoryMsg(userId) {
    const history = JSON.parse(await this.cacheManager.get(`msg_${userId}`));
    console.log(`该用户的历史消息为：${JSON.stringify(history)}`);
    return history;
  }
}
