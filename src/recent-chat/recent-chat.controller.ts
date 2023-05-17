import { Controller, Get, Patch, Query, Body } from '@nestjs/common';
import { RecentChatService } from './recent-chat.service';

@Controller('recent-chat')
export class RecentChatController {
  constructor(private readonly recentChatService: RecentChatService) {}

  @Get('/')
  async getRecentChat(@Query('userId') userId: number) {
    return await this.recentChatService.getRecentChat(userId);
  }

  @Patch('/')
  updateRecentChat(@Body() info) {
    const { userId, chatType, id, chatName } = info;
    return this.recentChatService.updateRecentChat({
      userId,
      chatType,
      chatId: id,
      chatName,
    });
  }
}
