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

  afterInit(server: any): any {
    this.socketService.initInstance(server);
  }

  async handleDisconnect(client: Socket) {
    await this.socketService.handleDisconnect(client);
  }
}
