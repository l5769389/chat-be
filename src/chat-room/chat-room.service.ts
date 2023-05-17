import { Injectable } from '@nestjs/common';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { Success } from '../common/Success';
import { RecentChatService } from '../recent-chat/recent-chat.service';
import { Repository } from 'typeorm';
import { ChatroomEntity } from '../entities/chatroom.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SocketService } from '../socket/socket.service';
import { ChatType, MsgFileType, MsgType } from '../types/types';

@Injectable()
export class ChatRoomService {
  constructor(
    private recentChatService: RecentChatService,
    @InjectRepository(ChatroomEntity)
    private chatroomRepository: Repository<ChatroomEntity>,
    private socketService: SocketService,
  ) {}

  async create(createChatRoomDto: CreateChatRoomDto) {
    const {
      createUserId,
      joinUserId: joinIds,
      chatRoomName,
    } = createChatRoomDto;
    const timestamp = new Date().getTime();
    const roomId = `c:${createUserId}_join:${joinIds}_time:${timestamp}`;
    createChatRoomDto.roomId = roomId;
    await this.chatroomRepository.save(createChatRoomDto);
    const msg: MsgType = {
      type: MsgFileType.Text,
      content: '',
      timestamp: timestamp.toString(),
    };
    const ids = joinIds.split(',').map((item) => Number.parseInt(item));
    this.socketService.sendToGroup(roomId, msg, ids);
    this.recentChatService.updateRecentChat({
      userId: createUserId,
      chatType: ChatType.Multi,
      chatId: roomId,
      chatName: chatRoomName,
      joinIds: ids,
    });
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
