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
    const history = JSON.parse(await this.cacheManager.get(key));
    if (history == null) {
      await this.set(key, JSON.stringify([val]));
    } else {
      history.push(val);
      await this.set(key, JSON.stringify(history));
    }
  }

  async updateUnique(key: string, uniqueKeyAttr: string, val: unknown) {
    const history = JSON.parse(await this.cacheManager.get(key));
    if (history === null) {
      await this.set(key, JSON.stringify([val]));
      return;
    }
    const targetVal = val[uniqueKeyAttr];
    const index = history.findIndex(
      (item) => item[uniqueKeyAttr] === targetVal,
    );
    if (index === -1) {
      history.unshift(val);
      await this.set(key, JSON.stringify(history));
    } else {
      history.splice(index, 1);
      history.unshift(val);
      await this.set(key, JSON.stringify(history));
    }
  }
}
