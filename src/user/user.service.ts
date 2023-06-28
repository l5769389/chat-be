import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Like, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { RelationEntity } from '../entities/relation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Success } from '../common/Success';
import { Failure } from '../common/Failure';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(RelationEntity)
    private relationRepository: Repository<RelationEntity>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    await this.checkUsername(createUserDto.username);
    await this.userRepository.save(createUserDto);
    return new Success();
  }

  async checkUsername(username: string) {
    const user = await this.findOne(username);
    if (user) {
      return new Failure('exist');
    }
    return new Success();
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(username: string) {
    const user: UserEntity = await this.userRepository.findOne({
      where: {
        username,
      },
    });
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findFriends(userId: number) {
    const entities = await this.relationRepository.find({
      where: {
        userId,
      },
    });
    const friends = [];
    for (const entity of entities) {
      const friendsInfo = await this.findUser(entity.friendsId);
      // 清空用户密码，不知道有没有更好的方式
      friendsInfo.password = '';
      if (friendsInfo) {
        friends.push(friendsInfo);
      }
    }
    return friends;
  }

  async findUser(userId: number) {
    return await this.userRepository.findOne({
      where: {
        userId,
      },
    });
  }

  async getUserInfo(userId: number) {
    const user = await this.findUser(userId);
    const friends = await this.findFriends(userId);
    user.password = '';
    return {
      friends: friends,
      user: user,
    };
  }

  async getFriends(userId: number) {
    const friends = await this.findFriends(userId);
    return {
      friends: friends,
    };
  }

  async getUsersInfo(userIds: Array<number>) {
    const usersInfo = {};
    for (const userId of userIds) {
      const info = await this.findUser(userId);
      info.password = '';
      usersInfo[userId] = info;
    }
    return usersInfo;
  }

  async search(userId, keyword: string) {
    const ans = await this.userRepository
      .createQueryBuilder('user')
      .where(
        'user.username Like :keyword OR user.nickname Like :keyword OR user.userId = :accuracy_keyword',
        {
          keyword: `%${keyword}%`,
          accuracy_keyword: `${keyword}`,
        },
      )
      .limit(10)
      .getMany();
    const friends = await this.findFriends(userId);
    const friends_ids = friends.map((item) => item.userId);
    const filteredFromFriends = ans.filter((item) => {
      if (!friends_ids.includes(item.userId)) {
        return item;
      }
    });
    const res = filteredFromFriends.map((item) => {
      item.password = '';
      return item;
    });
    return new Success(res);
  }
}
