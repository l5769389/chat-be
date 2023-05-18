import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { BullModule } from '@nestjs/bull';
import { OfflineMsgProcesssor } from './processsor/msg.processsor';
import { RedisCacheModule } from 'src/redis-cache/redis-cache.module';
import { FileService } from 'src/file/file.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'msg',
    }),
    RedisCacheModule,
  ],
  providers: [SocketGateway, SocketService, OfflineMsgProcesssor, FileService],
  exports: [SocketService],
})
export class SocketModule {}
