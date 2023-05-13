import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Public } from '../decorator/public/public.decorator';
import { LocalGuard } from './guard/local/local.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Public()
  @UseGuards(LocalGuard)
  @Post('/login')
  // 通过guards的验证，validate会往req中添加一个对象，可以通过以下方式获取。
  async login(@Request() req) {
    const { access_token } = await this.authService.login(req.user);
    return {
      access_token,
    };
  }
}
