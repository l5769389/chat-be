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
import { CLIENT_OP_SUB, SocketEvent } from '../types/types';
import { AnswerInviteDto } from './dto/answer-invite.dto';
import { RedisCacheService } from '../redis-cache/redis-cache.service';

@Injectable()
export class RelationService {
  constructor(
    @InjectRepository(RelationEntity)
    private relationRepository: Repository<RelationEntity>,
    private socketService: SocketService,
    private userService: UserService,
    private cacheManager: RedisCacheService,
  ) {}

  /**
   * 1. 获取想要添加人的信息
   * 2. 创建一个key 存入redis中，以便
   * 3. 告知socketio通知被添加人
   * @param createRelationDto
   */
  async invite(createRelationDto: CreateRelationDto) {
    const timestamp: number = new Date().getTime();
    const invite_key = `addFriend_from_${createRelationDto.userId}_to_${createRelationDto.friendsId}`;
    const invite_val = JSON.stringify(createRelationDto);
    this.cacheManager.set(invite_key, invite_val);
    const { user } = await this.userService.getUserInfo(
      createRelationDto.userId,
    );
    this.socketService.msgServiceSingle(
      {
        fromUserId: createRelationDto.userId,
        toUserId: createRelationDto.friendsId,
        msg: {
          opType: CLIENT_OP_SUB.ADD_FRIEND_INVITE,
          invite: {
            userInfo: user,
            invite_time: timestamp,
            invite_key: invite_key,
            invite_msg: createRelationDto.inviteMsg,
          },
        },
      },
      SocketEvent.CLIENT_OP,
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

  async remove(userId: number, friendUserId: number) {
    const relation = await this.relationRepository.findOne({
      where: {
        userId: userId,
        friendsId: friendUserId,
      },
    });
    const relation1 = await this.relationRepository.findOne({
      where: {
        userId: friendUserId,
        friendsId: userId,
      },
    });
    await this.relationRepository.delete(relation);
    await this.relationRepository.delete(relation1);
    await this._sendToFreshFriendsList([userId, friendUserId]);
    return new Success();
  }

  async handleAnswer(answerInviteDto: AnswerInviteDto) {
    const inviteInfo: CreateRelationDto = JSON.parse(
      await this.cacheManager.getAndDelete(answerInviteDto.invite_key),
    );
    await this.create(inviteInfo);
    await this._sendToFreshFriendsList([
      inviteInfo.userId,
      inviteInfo.friendsId,
    ]);
    return new Success();
  }

  async _sendToFreshFriendsList(userIds: number[]) {
    for (const id of userIds) {
      await this.socketService.msgServiceSingle(
        {
          fromUserId: -1,
          toUserId: id,
          msg: {
            opType: CLIENT_OP_SUB.FRESH_FRIENDS_LIST,
          },
        },
        SocketEvent.CLIENT_OP,
      );
    }
  }

  async create(inviteInfo) {
    const relationEntities = await this.relationRepository.find({
      where: {
        userId: inviteInfo.userId,
        friendsId: inviteInfo.friendsId,
      },
    });
    if (relationEntities.length > 0) {
    } else {
      await this.relationRepository.save(inviteInfo);
      const other = new CreateRelationDto();
      other.userId = inviteInfo.friendsId;
      other.friendsId = inviteInfo.userId;
      await this.relationRepository.save(other);
    }
  }
}
