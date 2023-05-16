import { Module } from '@nestjs/common';
import { RecentChatService } from './recent-chat.service';
import { RecentChatController } from './recent-chat.controller';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';


@Module({
  imports: [RedisCacheModule],
  controllers: [RecentChatController],
  providers: [RecentChatService],
})
export class RecentChatModule {}
