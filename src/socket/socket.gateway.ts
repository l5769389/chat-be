import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { Server, Socket } from 'socket.io';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import { SocketEvent } from '../types/types';

@WebSocketGateway(3001, {
  cors: true,
  transports: ['polling', 'websocket'],
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly socketService: SocketService,
    private cacheManager: RedisCacheService,
    @InjectQueue('msg') private readonly queue: Queue,
  ) {}

  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    this.server.on('connection', async (socket: Socket) => {
      //
      console.log('connect');
    });
  }

  @SubscribeMessage('connection')
  async handleConnection1(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('connect');
  }

  @SubscribeMessage(SocketEvent.CHAT_MSG_SINGLE)
  async handleSingleMsg(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    await this.socketService.msgServiceSingle(data);
  }

  @SubscribeMessage(SocketEvent.CHAT_MSG_MULTI)
  async handleMultiMsg(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    await this.socketService.msgServiceMulti(data, client);
  }

  @SubscribeMessage(SocketEvent.CONNECTED)
  async handleMsg1(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    console.log('connected');
    await this.socketService.afterConnected(data, client);
  }

  @SubscribeMessage(SocketEvent.OFFER_INVITE)
  async handleMsg2(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    console.log(`收到事件:${SocketEvent.OFFER_INVITE}`);
    await this.socketService.offerInvite(client, data);
  }

  @SubscribeMessage(SocketEvent.ANSWER_INVITE)
  async handleMsg4(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    console.log(`收到事件:${SocketEvent.ANSWER_INVITE}`);
    console.log(`${JSON.stringify(data)}`);
    await this.socketService.answerInvite(client, data);
  }

  @SubscribeMessage(SocketEvent.VIDEO_ROOM_MSG)
  async handleMsg3(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    console.log(`收到${SocketEvent.VIDEO_ROOM_MSG}`);
    const { roomId, content } = data;
    client.to(roomId).emit(SocketEvent.VIDEO_ROOM_MSG, content);
  }

  @SubscribeMessage(SocketEvent.VIDEO_ROOM_CHANGE_MSG)
  async handleMsg5(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { roomId, type, content } = data;
    console.log(
      `${SocketEvent.VIDEO_ROOM_CHANGE_MSG}, ${roomId}, ${type}, ${content}`,
    );
    client.to(roomId).emit(SocketEvent.VIDEO_ROOM_CHANGE_MSG, {
      type,
    });
  }

  @SubscribeMessage(SocketEvent.REMOTE_CONTROL)
  async handleMsg6(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { roomId, content } = data;
    client.to(roomId).emit(SocketEvent.REMOTE_CONTROL, content);
  }

  afterInit(server: any): any {
    this.socketService.initInstance(server);
  }

  async handleDisconnect(client: Socket) {
    await this.socketService.handleDisconnect(client);
  }
}
