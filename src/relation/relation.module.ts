import { Module } from '@nestjs/common';
import { RelationService } from './relation.service';
import { RelationController } from './relation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelationEntity } from '../entities/relation.entity';
import { SocketModule } from '../socket/socket.module';
import { UserModule } from '../user/user.module';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RelationEntity]),
    SocketModule,
    UserModule,
    RedisCacheModule,
  ],
  controllers: [RelationController],
  providers: [RelationService],
})
export class RelationModule {}
