import { Module } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { ChatRoomController } from './chat-room.controller';
import { RecentChatService } from '../recent-chat/recent-chat.service';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatroomEntity } from '../entities/chatroom.entity';

@Module({
  imports: [RedisCacheModule,TypeOrmModule.forFeature([ChatroomEntity])],
  controllers: [ChatRoomController],
  providers: [ChatRoomService, RecentChatService],
})
export class ChatRoomModule {}
