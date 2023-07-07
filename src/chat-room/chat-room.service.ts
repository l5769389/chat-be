import { Injectable } from '@nestjs/common';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { Success } from '../common/Success';
import { Repository } from 'typeorm';
import { ChatroomEntity } from '../entities/chatroom.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SocketService } from '../socket/socket.service';
import { ChatType, MsgFileType, MsgType } from '../types/types';
import { UserChatroomEntity } from '../entities/user_chatroom.entity';
import { CreateUserChatRoomDto } from './dto/create-user-chat-room.dto';
import { json } from 'stream/consumers';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectRepository(ChatroomEntity)
    private chatroomRepository: Repository<ChatroomEntity>,
    @InjectRepository(UserChatroomEntity)
    private userChatroomRepository: Repository<UserChatroomEntity>,
    private socketService: SocketService,
  ) {}

  async create(createChatRoomDto: CreateChatRoomDto) {
    const {
      createUserId,
      joinUsersInfo,
      joinUserId: joinIds,
      chatRoomName,
    } = createChatRoomDto;
    const timestamp = new Date().getTime();
    const roomId = `c:${createUserId}_join:${joinIds}_time:${timestamp}`;
    createChatRoomDto.roomId = roomId;
    console.log(JSON.stringify(createChatRoomDto));
    await this.chatroomRepository.save(createChatRoomDto);
    const ids = joinIds.split(',').map((item) => Number.parseInt(item));
    //将每一个id记录到db中
    for (const id of ids) {
      const dto = new CreateUserChatRoomDto(id, roomId);
      await this.userChatroomRepository.save(dto);
    }
    // 告知每一个客户端被拉进了一个群
    await this.socketService.joinUserToRoom({
      createUserId,
      roomId,
      joinUserIds: ids,
      chatRoomName,
      joinUsersInfo,
    });

    return new Success({
      roomId: roomId,
      joinIds: joinIds,
      chatRoomName,
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
