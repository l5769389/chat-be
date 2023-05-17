import { FileService } from '../file/file.service';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { Server, Socket } from 'socket.io';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import { RecentChatService } from '../recent-chat/recent-chat.service';
import { ChatType, MsgFileType, MsgType } from '../types/types';
import { WebSocketServer } from '@nestjs/websockets';

@Injectable()
export class SocketService {
  constructor(
    private cacheManager: RedisCacheService,
    @InjectQueue('msg') private readonly queue: Queue,
    private fileService: FileService,
    private recentChatService: RecentChatService,
  ) {}

  server: Server;

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

  async msgServiceSingle(data: any) {
    const { fromUserId, toUserId, msg, msgType, timestamp } = data;
    console.log(`收到socket消息,${JSON.stringify(data)}`);
    await this.sendMsg({ fromUserId, toUserId, msg, timestamp });
  }

  async msgServiceMulti(data: any, client: Socket) {
    const { fromUserId, toUserId, msg, msgType, timestamp } = data;
    console.log(`收到socket消息,${JSON.stringify(data)}`);
    // await this.sendMsg(fromUserId, toUserId, msg, timestamp);
  }

  async sendToGroup(roomId, msg, joinUserIds: Array<number>) {
    console.log(roomId, msg, joinUserIds);
  }

  async sendMsg({ fromUserId, toUserId, msg, timestamp, roomId = toUserId }) {
    const socketId: string = await this.cacheManager.get(toUserId);
    //   如果客户端在线，那么直接发送过去，否则就储存起来，等上线后一次性全部发送。
    if (socketId) {
      await this.sendOnlineMsg(socketId, fromUserId, msg, timestamp, toUserId);
    } else {
      await this.sendOfflineMsg(socketId, fromUserId, toUserId, msg, timestamp);
    }
  }

  async sendOnlineMsg(
    socketId,
    fromUserId,
    msg: MsgType,
    timestamp: string,
    toUserId,
  ) {
    console.log(`向${socketId}发出msg消息`);
    this.server.to(socketId).emit('msg', {
      fromUserId,
      msg,
      timestamp,
    });
    await this.recentChatService.updateRecentChat({
      userId: fromUserId,
      chatType: ChatType.Single,
      chatId: toUserId,
    });
    await this.recentChatService.updateRecentChat({
      userId: toUserId,
      chatType: ChatType.Single,
      chatId: fromUserId,
    });
  }

  async sendOfflineMsg(
    socketId,
    fromUserId,
    toUserId,
    msg: MsgType,
    timestamp,
  ) {
    if (msg.type === MsgFileType.Text) {
      console.log('对方离线，消息存入redis中');
      const msgKey = `msg_${toUserId}`;
      await this.cacheManager.update(msgKey, {
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
        const msgKey = `msg_${toUserId}`;
        await this.cacheManager.update(msgKey, {
          fromUserId,
          msg: new_msg,
        });
      }
    }
  }

  async sendMsgHistory(fromUserId, toUserId, msg: MsgType) {
    const socketId: string = await this.cacheManager.get(toUserId);
    // 客户端上线后发送历史消息。
    const { type, content, timestamp } = msg;
    if (type === MsgFileType.Text) {
      this.server.to(toUserId).emit('msg', {
        fromUserId,
        msg,
      });
    } else {
      const blob = await this.fileService.filePath2Blob(content as string);
      msg.content = blob;
      this.server.to(toUserId).emit('msg', {
        fromUserId,
        msg,
      });
    }
  }

  async sendAllHistoryMsg(client: Socket, history, toUserId) {
    for (const historyItem of history) {
      await this.sendMsgHistory(
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

  initInstance(server: Server) {
    this.server = server;
  }
}
