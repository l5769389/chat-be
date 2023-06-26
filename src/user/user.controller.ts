import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CACHE_MANAGER, CacheKey } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from '../decorator/public/public.decorator';

@Controller('/api')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Get('/user')
  async getUserInfo(@Request() req) {
    return this.userService.getUserInfo(req.user.userId);
  }

  @Get('/users')
  async getUsersInfo(@Query('ids') ids: string) {
    const id_arr = ids.split(',').map((item) => Number.parseInt(item));
    return this.userService.getUsersInfo(id_arr);
  }

  @Public()
  @Post('/user')
  async create(@Body() createUserDto: CreateUserDto) {
    if (!createUserDto.avatar) {
      createUserDto.avatar = '/static/default_avatar.png';
    }
    if (!createUserDto.nickname) {
      createUserDto.nickname = '爱吃炸鸡的路人甲';
    }
    return this.userService.create(createUserDto);
  }

  @Public()
  @Get('/checkUsername')
  async check(@Query('username') username: string) {
    return await this.userService.checkUsername(username);
  }

  @Get('/search')
  async searchByKeyword(@Query('keyword') keyword: string){
    return  await this.userService.search(keyword)
  }
}
