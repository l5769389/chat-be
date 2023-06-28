import { Get, Injectable } from '@nestjs/common';
import { Public } from './decorator/public/public.decorator';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHello(): string {
    console.log(this.configService.get('http'));
    return 'Hello World!';
  }
}
