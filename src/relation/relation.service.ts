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

@Injectable()
export class RelationService {
  constructor(
    @InjectRepository(RelationEntity)
    private relationRepository: Repository<RelationEntity>,
    private socketService: SocketService,
    private userService: UserService,
  ) {}

  async create(createRelationDto: CreateRelationDto) {
    // await this.relationRepository.save(createRelationDto);
    const { user } = await this.userService.getUserInfo(
      createRelationDto.userId,
    );
    this.socketService.msgServiceSingle(
      {
        fromUserId: 2,
        toUserId: createRelationDto.friendsId,
        msg: user,
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
}
