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

@WebSocketGateway({ cors: true })
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
    });
  }

  @SubscribeMessage('SingleMsg')
  async handleSingleMsg(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    await this.socketService.msgServiceSingle(data);
  }

  @SubscribeMessage('MultiMsg')
  async handleMultiMsg(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    await this.socketService.msgServiceMulti(data, client);
  }

  @SubscribeMessage('connected')
  async handleMsg1(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.socketService.afterConnected(data, client);
  }

  @SubscribeMessage('join_video_room')
  async handleMsg2(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    client.emit('joined_video_room');
    client.join('demo');
    client.broadcast.to('demo').emit('other_join_room', client.id);
  }

  @SubscribeMessage('video_room_message')
  async handleMsg3(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    console.log(`video_room_message,内容是：${JSON.stringify(data)}`)
    client.broadcast.to('demo').emit('video_room_message', data);
  }

  afterInit(server: any): any {
    this.socketService.initInstance(server);
  }

  async handleDisconnect(client: Socket) {
    await this.socketService.handleDisconnect(client);
  }
}
