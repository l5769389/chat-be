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
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import * as redisStore from 'cache-manager-redis-store';
import type { RedisClientOptions } from 'redis';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { FileModule } from './file/file.module';

const DbModule = TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '123456',
  database: 'chat_db',
  entities: [UserEntity, RelationEntity],
  synchronize: true,
  logging: false,
});

const Bull = BullModule.forRoot({
  redis: {
    host: 'localhost',
    port: 6379,
    password: '123456',
  },
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
