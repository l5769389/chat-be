import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocketModule } from './socket/socket.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './filter/http-exception/http-exception.filter';
import { AuthModule } from './auth/auth.module';
import { RelationEntity } from './entities/relation.entity';
import { UserEntity } from './entities/user.entity';
import { JwtGuard } from './auth/guard/jwt/jwt.guard';
import { BullModule } from '@nestjs/bull';

import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { FileModule } from './file/file.module';
import { ChatRoomModule } from './chat-room/chat-room.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { ChatroomEntity } from './entities/chatroom.entity';
import { UserChatroomEntity } from './entities/user_chatroom.entity';

const { mysql, redis } = configuration();

const mysqlConfig = Object.assign({}, mysql, {
  type: 'mysql',
  entities: [UserEntity, RelationEntity, ChatroomEntity, UserChatroomEntity],
  synchronize: true,
  logging: false,
});
const DbModule = TypeOrmModule.forRoot(mysqlConfig);

const Bull = BullModule.forRoot({
  redis: {
    host: redis.host,
    port: redis.port,
    password: redis.auth_pass,
  },
});

const Config = ConfigModule.forRoot({
  isGlobal: true,
  load: [configuration],
});

@Module({
  imports: [
    SocketModule,
    DbModule,
    UserModule,
    AuthModule,
    Bull,
    RedisCacheModule,
    FileModule,
    ChatRoomModule,
    Config,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
