import { Injectable } from '@nestjs/common';
import { CreateRelationDto } from './dto/create-relation.dto';
import { UpdateRelationDto } from './dto/update-relation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RelationEntity } from '../entities/relation.entity';
import { Repository } from 'typeorm';
import { Success } from '../common/Success';
import { SocketService } from '../socket/socket.service';
// import { SocketEvent } from '../types/types';
import { UserService } from '../user/user.service';
import { SocketEvent } from '../types/types';
import { AnswerInviteDto } from './dto/answer-invite.dto';

@Injectable()
export class RelationService {
  constructor(
    @InjectRepository(RelationEntity)
    private relationRepository: Repository<RelationEntity>,
    private socketService: SocketService,
    private userService: UserService,
  ) {}

  /**
   * 1. 获取想要添加人的信息
   * 2. 创建一个key 存入redis中，以便
   * 3. 告知socketio通知被添加人
   * @param createRelationDto
   */
  async invite(createRelationDto: CreateRelationDto) {
    // await this.relationRepository.save(createRelationDto);
    // todo
    const { user } = await this.userService.getUserInfo(
      createRelationDto.userId,
    );
    const timestamp: number = new Date().getTime();
    this.socketService.msgServiceSingle(
      {
        fromUserId: 2,
        toUserId: createRelationDto.friendsId,
        msg: user,
        invite_time: timestamp,
      },
      SocketEvent.ADD_FRIEND_INVITE,
    );
    return new Success();
  }

  findAll() {
    return `This action returns all relation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} relation`;
  }

  update(id: number, updateRelationDto: UpdateRelationDto) {
    return `This action updates a #${id} relation`;
  }

  remove(id: number) {
    return `This action removes a #${id} relation`;
  }

  async create(answerInviteDto: AnswerInviteDto) {
    return Promise.resolve(undefined);
  }
}
