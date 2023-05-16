import { Injectable } from '@nestjs/common';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { Success } from '../common/Success';
import { RecentChatService } from '../recent-chat/recent-chat.service';
import { Repository } from 'typeorm';
import { ChatroomEntity } from '../entities/chatroom.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChatRoomService {
  constructor(
    private recentChatService: RecentChatService,
    @InjectRepository(ChatroomEntity)
    private chatroomRepository: Repository<ChatroomEntity>,
  ) {}

  async create(createChatRoomDto: CreateChatRoomDto) {
    const { createUserId, joinUserId: joinIds } = createChatRoomDto;
    const timestamp = new Date().getTime();
    const roomId = `c:${createUserId}_join:${joinIds}_time:${timestamp}`;
    createChatRoomDto.roomId = roomId;
    await this.chatroomRepository.save(createChatRoomDto);
    return new Success({
      roomId: roomId,
      joinIds: joinIds,
    });
  }

  findAll() {
    return `This action returns all chatRoom`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chatRoom`;
  }

  update(id: number, updateChatRoomDto: UpdateChatRoomDto) {
    return `This action updates a #${id} chatRoom`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatRoom`;
  }
}
