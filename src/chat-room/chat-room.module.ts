import { Module } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { ChatRoomController } from './chat-room.controller';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatroomEntity } from '../entities/chatroom.entity';
import { SocketService } from '../socket/socket.service';
import { SocketModule } from '../socket/socket.module';
import { BullModule } from '@nestjs/bull';
import { FileService } from '../file/file.service';
import { UserChatroomEntity } from '../entities/user_chatroom.entity';

@Module({
  imports: [
    RedisCacheModule,
    TypeOrmModule.forFeature([ChatroomEntity, UserChatroomEntity]),
    SocketModule,
    BullModule.registerQueue({
      name: 'msg',
    }),
    RedisCacheModule,
  ],
  controllers: [ChatRoomController],
  providers: [ChatRoomService, FileService, SocketService],
})
export class ChatRoomModule {}
