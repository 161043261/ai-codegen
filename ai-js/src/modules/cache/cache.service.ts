import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LRUCache } from "lru-cache";
import { createClient, RedisClientType } from "redis";

export interface CacheStore {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy, CacheStore {
  private redisClient: RedisClientType | null = null;
  private memoryCache: LRUCache<string, string>;
  private useRedis = false;

  constructor(private configService: ConfigService) {
    // Initialize LRU cache as fallback
    this.memoryCache = new LRUCache<string, string>({
      max: 1000, // Maximum number of items
      ttl: 1000 * 60 * 60, // Default TTL: 1 hour
      updateAgeOnGet: true,
    });
  }

  async onModuleInit() {
    const redisEnabled = this.configService.get("REDIS_ENABLED") !== "false";
    const redisHost = this.configService.get("REDIS_HOST");

    if (redisEnabled && redisHost) {
      try {
        this.redisClient = createClient({
          url: `redis://${redisHost}:${this.configService.get("REDIS_PORT") || 6379}`,
          password: this.configService.get("REDIS_PASSWORD") || undefined,
        });

        this.redisClient.on("error", (err) => {
          console.warn("Redis cache error:", err.message);
          this.useRedis = false;
        });

        await this.redisClient.connect();
        this.useRedis = true;
        console.log("Cache store: Redis");
      } catch (error) {
        console.warn(
          "Failed to connect to Redis for cache, using LRU memory cache:",
          (error as Error).message,
        );
        this.useRedis = false;
      }
    } else {
      console.log("Cache store: LRU Memory");
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  getRedisClient(): RedisClientType | null {
    return this.useRedis ? this.redisClient : null;
  }

  isRedisEnabled(): boolean {
    return this.useRedis;
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      if (this.useRedis && this.redisClient) {
        const value = await this.redisClient.get(key);
        return value ? JSON.parse(value) : undefined;
      }
      const value = this.memoryCache.get(key);
      return value ? JSON.parse(value) : undefined;
    } catch {
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (this.useRedis && this.redisClient) {
      if (ttl) {
        await this.redisClient.setEx(key, ttl, serialized);
      } else {
        await this.redisClient.set(key, serialized);
      }
    } else {
      this.memoryCache.set(key, serialized, {
        ttl: ttl ? ttl * 1000 : undefined,
      });
    }
  }

  async del(key: string): Promise<void> {
    if (this.useRedis && this.redisClient) {
      await this.redisClient.del(key);
    } else {
      this.memoryCache.delete(key);
    }
  }

  async has(key: string): Promise<boolean> {
    if (this.useRedis && this.redisClient) {
      return (await this.redisClient.exists(key)) === 1;
    }
    return this.memoryCache.has(key);
  }

  async clear(): Promise<void> {
    if (this.useRedis && this.redisClient) {
      await this.redisClient.flushDb();
    } else {
      this.memoryCache.clear();
    }
  }
}
