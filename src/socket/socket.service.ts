import { FileService } from '../file/file.service';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { Server, Socket } from 'socket.io';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import { ChatType, MsgFileType, MsgType } from '../types/types';
import { timestamp } from 'rxjs';

const socketMap = new Map<number, Socket>(); //登录进来的socket实例。

@Injectable()
export class SocketService {
  constructor(
    private cacheManager: RedisCacheService,
    @InjectQueue('msg') private readonly queue: Queue,
    private fileService: FileService,
  ) {}

  server: Server;

  async handleDisconnect(client: Socket) {
    const userId: string = await this.cacheManager.get(client.id);
    console.log(`断开链接,socketId: ${client.id},userId: ${userId}`);
    await this.cacheManager.del(client.id);
    await this.cacheManager.del(userId);
    socketMap.delete(Number.parseInt(userId));
  }

  async afterConnected(data: any, client: Socket) {
    // 收到连接信息,来保存用户的id和会话。
    console.log('connected', data, client.id);
    socketMap.set(data.userId, client);
    await this.cacheManager.set(data.userId, client.id);
    await this.cacheManager.set(client.id, data.userId);
    const history = await this.findHistoryMsg(data.userId);
    if (history) {
      await this.sendAllHistoryMsg(data.userId, history);
    }
    await this.cacheManager.del(`msg_${data.userId}`);
  }

  async msgServiceSingle(data: any) {
    const { fromUserId, toUserId, msg, msgType } = data;
    console.log(`收到socket消息,from:${fromUserId},to:${toUserId}`);
    await this.sendMsg({ fromUserId, toUserId, msg });
  }

  async msgServiceMulti(data: any, client: Socket) {
    const { fromUserId, toUserId, msg, msgType, timestamp } = data;
    console.log(`收到socket消息,${JSON.stringify(data)}`);
  }

  async sendToGroup(roomId, msg, joinUserIds: Array<number>) {
    console.log(111);
  }

  async joinUserToRoom({ createUserId, roomId, joinUserIds, chatRoomName }) {
    const timestamp = new Date().getTime().toString();
    const msg = {
      type: MsgFileType.Text,
      content: '',
      timestamp,
      chatRoomName,
      roomId,
      joinUserIds,
    };
    console.log(`向${JSON.stringify(joinUserIds)}发出通知加入了群聊`);
    for (const joinUserId of joinUserIds) {
      this.sendMsg({
        eventName: 'joinRoom',
        fromUserId: createUserId,
        toUserId: joinUserId,
        msg,
      });
    }
  }

  async sendMsg({ eventName = 'msg', toUserId, msg, fromUserId = -1 }) {
    //   如果客户端在线，那么直接发送过去，否则就储存起来，等上线后一次性全部发送。
    if (this.judgeUserIsOnline(toUserId)) {
      await this.sendOnlineMsg({
        eventName,
        fromUserId,
        msg,
        toUserId,
      });
    } else {
      await this.sendOfflineMsg({
        eventName,
        fromUserId,
        msg,
        toUserId,
      });
    }
  }

  judgeUserIsOnline(userId: number) {
    const online = socketMap.has(userId);
    console.log(`userId:${userId} online:${online}`);
    return online;
  }

  async sendOnlineMsg({ eventName = 'msg', fromUserId, msg, toUserId }) {
    console.log(`向${toUserId}发出消息`);
    const client = socketMap.get(toUserId);
    client.emit(eventName, {
      fromUserId,
      msg,
    });
  }

  async sendOfflineMsg({ eventName, fromUserId, toUserId, msg }) {
    if (msg.type === MsgFileType.Text) {
      console.log(`对方离线，消息存入redis中，消息类型:${msg.type}`);
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
    const client = socketMap.get(toUserId);
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

  async sendAllHistoryMsg(toUserId, history) {
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
