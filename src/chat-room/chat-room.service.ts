import { Injectable } from '@nestjs/common';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { Success } from '../common/Success';
import { SocketService } from '../socket/socket.service';

@Injectable()
export class ChatRoomService {
  create(createChatRoomDto: CreateChatRoomDto) {
    const { createId, joinIds } = createChatRoomDto;
    const join = joinIds.join('|');
    const timestamp = new Date().getTime();
    const roomId = `c:${createId}_join:${join}_time:${timestamp}`;
    return new Success({
      roomId: roomId,
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
