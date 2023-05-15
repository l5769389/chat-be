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
import { Public } from 'src/decorator/public/public.decorator';

@Controller('/api')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  @Public()
  @Get('/test')
  async create() {
    await this.cacheManager.set('abc', 3);
  }

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
}
