import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
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
    const friends = await this.findFriends(userId);
    const user = await this.findUser(userId);
    user.password = '';
    return {
      user: user,
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

  async search(keyword: string) {
    await this.userRepository.find({
      //todo search
    });
  }
}
