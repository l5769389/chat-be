import { Injectable } from '@nestjs/common';

import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { ChatType, RecentChatType } from '../types/types';

@Injectable()
export class RecentChatService {
  constructor(private cacheManager: RedisCacheService) {}

  async getRecentChat(userId: number) {
    const key = `recent_chat_userId_${userId}`;
    return [
      {
        type: 'Single',
        id: 2,
      },
      {
        type: 'Multi',
        joinIds: [2, 3, 4],
        id: 'c-1-2-12344',
        name: 'ssss',
      },
    ];
    // const list = JSON.parse(await this.cacheManager.get(key));
    // if (list) {
    //   return list;
    // } else {
    //   return [];
    // }
  }

  async updateRecentChat(
    userId: number,
    chatType: ChatType,
    id: number | string,
    chatName = 'default',
  ) {
    const key = `recent_chat_userId_${userId}`;
    const newOne: RecentChatType = {
      type: chatType,
      id: id,
      name: chatName,
    };
    await this.cacheManager.updateUnique(key, 'id', newOne);
    return this.getRecentChat(userId);
  }
}
