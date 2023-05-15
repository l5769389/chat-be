import { Module } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';
import { CacheModule } from '@nestjs/cache-manager';
import type { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import configuration from '../config/configuration';

const { redis } = configuration();
const Cache = CacheModule.registerAsync<RedisClientOptions>({
  isGlobal: true,
  useFactory: async () => {
    return Object.assign(
      {},
      { ...redis },
      {
        store: redisStore,
      },
    );
  },
});

@Module({
  imports: [Cache],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
