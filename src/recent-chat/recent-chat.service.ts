import { Injectable } from '@nestjs/common';

import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { ChatType, RecentChatType } from '../types/types';

@Injectable()
export class RecentChatService {
  constructor(private cacheManager: RedisCacheService) {}
  async getRecentChat(userId: number) {
    const key = `recent_chat_userId_${userId}`;
    const list = JSON.parse(await this.cacheManager.get(key));
    if (list) {
      return list;
    } else {
      return [];
    }
  }

  async updateRecentChat(
    userId: number,
    chatType: ChatType,
    id: number | string,
  ) {
    const key = `recent_chat_userId_${userId}`;
    const newOne: RecentChatType = {
      type: chatType,
      id: id,
    };
    await this.cacheManager.updateUnique(key, 'id', newOne);
    return this.getRecentChat(userId);
  }
}
