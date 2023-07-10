import { FileService } from '../file/file.service';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { Server, Socket } from 'socket.io';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import { ChatType, MsgFileType, MsgType, SocketEvent } from '../types/types';

const socketMap = new Map<number, Socket>(); //登录进来的socket实例。
interface msgServiceMultiType {
  toChatRoomId: string;
  fromUserId: number;
  msg: any;
  joinUserIds: Array<number>;
}

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
    if (userId) {
      await this.cacheManager.del(userId);
      socketMap.delete(Number.parseInt(userId));
    }
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

  async msgServiceSingle(data: any, eventName) {
    const { fromUserId, toUserId, msg } = data;
    console.log(
      `收到socket消息,from:${fromUserId},to:${toUserId},event:${eventName}`,
    );
    await this.sendMsgOnlineOrOffline({
      eventName,
      fromUserId,
      toUserId,
      msg,
    });
  }

  async msgServiceMulti(data: msgServiceMultiType, client: Socket) {
    const { toChatRoomId, fromUserId, msg, joinUserIds: joinUserIds } = data;
    console.log(`收到发送的群聊socket消息`);
    this.sendToGroup(fromUserId, toChatRoomId, msg, joinUserIds);
  }

  async sendToGroup(
    fromUserId: number,
    roomId,
    msg,
    joinUserIds: Array<number>,
  ) {
    console.log(joinUserIds);
    const excludeIds = joinUserIds.filter((item) => item !== fromUserId);
    for (const joinUserId of excludeIds) {
      this.sendMsgOnlineOrOffline({
        eventName: SocketEvent.CHAT_MSG_MULTI,
        fromUserId: fromUserId,
        toUserId: joinUserId,
        msg,
        chatId: roomId,
        joinUserIds,
      });
    }
  }

  async joinUserToRoom({
    createUserId,
    roomId,
    joinUserIds,
    chatRoomName,
    joinUsersInfo,
  }) {
    const timestamp = new Date().getTime().toString();
    const msg = {
      type: MsgFileType.Text,
      content: '',
      timestamp,
    };
    console.log(`向${JSON.stringify(joinUserIds)}发出通知加入了群聊`);
    for (const joinUserId of joinUserIds) {
      this.sendMsgOnlineOrOffline({
        eventName: SocketEvent.CHAT_JOIN_ROOM,
        fromUserId: createUserId,
        toUserId: joinUserId,
        chatRoomName,
        chatId: roomId,
        joinUserIds,
        msg,
        joinUsersInfo,
      });
    }
  }

  async sendMsgOnlineOrOffline({
    eventName = 'msg',
    fromUserId = -1, // 系统消息
    toUserId, //要发送给的客户端
    msg, // 消息内容
    chatId = fromUserId, // 该项是群的id
    joinUserIds = [], // 群的参加者id
    chatRoomName = '', // 群名称,
    ...args
  }) {
    //   如果客户端在线，那么直接发送过去，否则就储存起来，等上线后一次性全部发送。
    if (this.judgeUserIsOnline(toUserId)) {
      await this.sendOnlineMsg({
        eventName,
        fromUserId,
        toUserId,
        msg,
        chatId,
        joinUserIds,
        chatRoomName,
        args,
      });
    } else {
      await this.sendOfflineMsg({
        eventName,
        fromUserId,
        toUserId,
        msg,
        chatId,
        joinUserIds,
        chatRoomName,
        args,
      });
    }
  }

  async sendMsg(
    client,
    eventName = 'msg',
    fromUserId,
    msg,
    chatId = fromUserId,
    joinUserIds = [],
    chatRoomName,
    args = null,
  ) {
    client.emit(eventName, {
      fromUserId,
      msg,
      chatId,
      joinUserIds,
      chatRoomName,
      ...args,
    });
  }

  judgeUserIsOnline(userId: number) {
    const online = socketMap.has(userId);
    console.log(`userId:${userId} online:${online}`);
    return online;
  }

  async sendOnlineMsg({
    eventName = 'msg',
    fromUserId,
    msg,
    toUserId,
    chatId,
    joinUserIds,
    chatRoomName,
    args = null,
  }) {
    const client = socketMap.get(toUserId);
    console.log(`向${toUserId}发出消息:`);
    this.sendMsg(
      client,
      eventName,
      fromUserId,
      msg,
      chatId,
      joinUserIds,
      chatRoomName,
      args,
    );
  }

  async sendOfflineMsg({
    eventName,
    fromUserId,
    toUserId,
    msg,
    chatId,
    joinUserIds,
    chatRoomName,
    args = null,
  }) {
    if (msg.type === MsgFileType.Text) {
      console.log(`对方离线，消息存入redis中`);
      const msgKey = `msg_${toUserId}`;
      await this.cacheManager.update(msgKey, {
        eventName,
        fromUserId,
        msg,
        chatId,
        joinUserIds,
        chatRoomName,
        ...args,
      });
    } else if (msg.type === MsgFileType.IMG) {
      const imgName = `from_${fromUserId}_to_${toUserId}_${new Date().getTime()}`;
      const filePath = await this.fileService.saveFileToServe(
        msg.content as Buffer,
        imgName,
        'png',
      );
      if (filePath === '') {
        // 文件保存错误
      } else {
        const new_msg = Object.assign({}, msg, {
          content: filePath,
        });
        const msgKey = `msg_${toUserId}`;
        await this.cacheManager.update(msgKey, {
          eventName,
          fromUserId,
          msg: new_msg,
          chatId,
          joinUserIds,
          chatRoomName,
        });
      }
    }
  }

  async sendMsgHistory(
    toUserId,
    { eventName = 'msg', fromUserId, msg, chatId, joinUserIds, chatRoomName },
  ) {
    const client = socketMap.get(toUserId);
    // 客户端上线后发送历史消息。
    const { type, content } = msg;
    if (type === MsgFileType.IMG) {
      const blob = await this.fileService.filePath2Blob(content as string);
      msg.content = blob;
    }
    this.sendMsg(
      client,
      eventName,
      fromUserId,
      msg,
      chatId,
      joinUserIds,
      chatRoomName,
    );
  }

  async sendAllHistoryMsg(toUserId, history) {
    for (const historyItem of history) {
      await this.sendMsgHistory(toUserId, historyItem);
    }
  }

  async findHistoryMsg(userId) {
    const history = JSON.parse(await this.cacheManager.get(`msg_${userId}`));
    console.log(`该用户的历史消息为：`);
    return history;
  }

  /**
   *  A-向服务器发出的邀请 B的消息。
   * @param data
   */
  async offerInvite(client: Socket, data: any) {
    const { userId, oppositeId, ...args } = data;
    const time = new Date().getTime();
    const roomId = `f_${userId}_t_${oppositeId}_time_${time}`;
    client.emit(SocketEvent.CREATE_INVITE_ROOM, roomId);
    console.log(`发出invite,加入房间roomId:${roomId}`);
    client.join(roomId);
    this.sendMsgOnlineOrOffline({
      eventName: SocketEvent.OFFER_INVITE,
      fromUserId: userId,
      toUserId: oppositeId,
      msg: {
        type: MsgFileType.Text,
        content: '',
        roomId: roomId,
      },
      args,
    });
  }

  /**
   * B-向服务器发出的接受A邀请的消息。
   * @param data
   */
  async answerInvite(client, data: any) {
    const { userId, oppositeUserId, roomId, answer, ...args } = data;
    if (answer) {
      console.log(
        `接受请求，加入房间,roomId:${roomId},${userId},${oppositeUserId},${answer}`,
      );
      client.join(roomId);
    }
    this.sendMsgOnlineOrOffline({
      eventName: SocketEvent.ANSWER_INVITE,
      fromUserId: userId,
      toUserId: oppositeUserId,
      msg: {
        type: MsgFileType.Text,
        content: '',
        answer: answer,
      },
      args,
    });
  }

  initInstance(server: Server) {
    this.server = server;
  }
}
