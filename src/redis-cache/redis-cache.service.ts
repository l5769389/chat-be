import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
@Injectable()
export class RedisCacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}
  async get(key: string): Promise<string> {
    return await this.cacheManager.get(key);
  }
  async set(key: string, value: string, ttl = 0) {
    await this.cacheManager.set(key, value, ttl);
  }
  async del(key: string) {
    await this.cacheManager.del(key);
  }
  async update(key: string, val: unknown) {
    const msgKey = `msg_${key}`;
    const history_msg = JSON.parse(await this.cacheManager.get(msgKey));
    if (history_msg == null) {
      await this.set(msgKey, JSON.stringify([val]));
    } else {
      history_msg.push(val);
      await this.set(msgKey, JSON.stringify(history_msg));
    }
  }
}
