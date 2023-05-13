import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../../entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username, password) {
    const user: UserEntity = await this.authService.validateUser(
      username,
      password,
    );
    if (user !== null) {
      return user;
    }
    return new UnauthorizedException();
  }
}
