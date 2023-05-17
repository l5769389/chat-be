import { Injectable } from '@nestjs/common';

import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { ChatType, RecentChatType } from '../types/types';

@Injectable()
export class RecentChatService {
  constructor(private cacheManager: RedisCacheService) {}

  getChatRecentKey(userId: number) {
    return `recent_chat_userId_${userId}`;
  }

  async getRecentChat(userId: number) {
    const key = this.getChatRecentKey(userId);
    const list = JSON.parse(await this.cacheManager.get(key));
    if (list) {
      return list;
    } else {
      return [];
    }
  }

  /**
   * 更新key为 userId的在redis中记录的最近的聊天对象列表。
   * @param userId
   * @param chatType
   * @param id
   * @param chatName
   */
  async updateRecentChat({
    userId,
    chatType,
    chatId,
    chatName = 'default',
    joinIds = [],
  }) {
    const key = this.getChatRecentKey(userId);
    const newOne: RecentChatType = {
      type: chatType,
      id: chatId,
      name: chatName,
      joinIds: joinIds,
    };
    await this.cacheManager.updateUnique(key, 'id', newOne);
    return this.getRecentChat(userId);
  }
}
