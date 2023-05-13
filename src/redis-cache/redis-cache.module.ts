import { Module } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';
import { CacheModule } from '@nestjs/cache-manager';
import type { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';

const Cache = CacheModule.registerAsync<RedisClientOptions>({
  isGlobal: true,
  useFactory: async () => {
    return {
      store: redisStore,
      host: 'localhost',
      port: 6379,
      auth_pass: '123456',
      db: 0,
      ttl: 0,
    };
  },
});

@Module({
  imports: [Cache],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
