import { Module } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { ChatRoomController } from './chat-room.controller';
import { RecentChatService } from '../recent-chat/recent-chat.service';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';

@Module({
  imports: [RedisCacheModule],
  controllers: [ChatRoomController],
  providers: [ChatRoomService, RecentChatService],
})
export class ChatRoomModule {}
