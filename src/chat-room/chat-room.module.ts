import { Module } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { ChatRoomController } from './chat-room.controller';
import { RecentChatService } from '../recent-chat/recent-chat.service';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatroomEntity } from '../entities/chatroom.entity';
import { SocketService } from '../socket/socket.service';
import { SocketModule } from '../socket/socket.module';
import { BullModule } from '@nestjs/bull';
import { FileService } from '../file/file.service';

@Module({
  imports: [
    RedisCacheModule,
    TypeOrmModule.forFeature([ChatroomEntity]),
    SocketModule,
    BullModule.registerQueue({
      name: 'msg',
    }),
    RedisCacheModule,
  ],
  controllers: [ChatRoomController],
  providers: [ChatRoomService, RecentChatService, FileService, SocketService],
})
export class ChatRoomModule {}
