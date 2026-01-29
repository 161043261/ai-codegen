import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
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
  private readonly logger = new Logger(CacheService.name);
  private redisClient: RedisClientType | null = null;
  private memoryCache: LRUCache<string, string>;
  private useRedis = false;
  private redisEnabled = false;

  constructor(private configService: ConfigService) {
    // Initialize LRU cache as fallback
    this.memoryCache = new LRUCache<string, string>({
      max: 1000, // Maximum number of items
      ttl: 1000 * 60 * 60, // Default TTL: 1 hour
      updateAgeOnGet: true,
    });
  }

  async onModuleInit() {
    // Check if Redis is explicitly disabled
    const redisEnabledConfig = this.configService.get("REDIS_ENABLED");
    this.redisEnabled =
      redisEnabledConfig !== "false" && redisEnabledConfig !== false;

    if (!this.redisEnabled) {
      this.logger.log(
        "Redis disabled by configuration, using LRU Memory cache",
      );
      return;
    }

    const redisHost = this.configService.get("REDIS_HOST");
    if (!redisHost) {
      this.logger.log("Redis host not configured, using LRU Memory cache");
      return;
    }

    try {
      const redisPort = this.configService.get("REDIS_PORT") || 6379;
      const redisPassword = this.configService.get("REDIS_PASSWORD");

      this.redisClient = createClient({
        url: `redis://${redisHost}:${redisPort}`,
        password: redisPassword || undefined,
        socket: {
          connectTimeout: 5000, // 5 seconds timeout
          reconnectStrategy: (retries) => {
            // Only retry 3 times, then give up
            if (retries > 3) {
              this.logger.warn(
                "Redis connection failed after 3 retries, falling back to LRU Memory cache",
              );
              this.fallbackToMemoryCache();
              return false; // Stop retrying
            }
            const delay = Math.min(retries * 500, 2000);
            this.logger.log(
              `Redis reconnect attempt ${retries}/3, next retry in ${delay}ms...`,
            );
            return delay; // Exponential backoff
          },
        },
      });

      // Handle connection errors silently after initial connection
      this.redisClient.on("error", (err) => {
        if (this.useRedis) {
          this.logger.warn(
            `Redis error: ${err.message}, switching to LRU Memory cache`,
          );
          this.fallbackToMemoryCache();
        }
      });

      // Connect with timeout
      await Promise.race([
        this.redisClient.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Connection timeout")), 5000),
        ),
      ]);

      this.useRedis = true;
      this.logger.log("Cache store: Redis");
    } catch (error) {
      this.logger.warn(
        `Failed to connect to Redis: ${(error as Error).message}, using LRU Memory cache`,
      );
      await this.fallbackToMemoryCache();
    }
  }

  /**
   * Fallback to memory cache and cleanup Redis connection
   */
  private async fallbackToMemoryCache(): Promise<void> {
    this.useRedis = false;
    if (this.redisClient) {
      try {
        await this.redisClient.quit();
      } catch {
        // Ignore quit errors
      }
      this.redisClient = null;
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      try {
        await this.redisClient.quit();
      } catch {
        // Ignore quit errors
      }
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
    try {
      if (this.useRedis && this.redisClient) {
        if (ttl) {
          await this.redisClient.setEx(key, ttl, serialized);
        } else {
          await this.redisClient.set(key, serialized);
        }
        return;
      }
    } catch (error) {
      this.logger.warn(
        `Redis set error: ${(error as Error).message}, using memory cache`,
      );
      this.fallbackToMemoryCache();
    }
    this.memoryCache.set(key, serialized, {
      ttl: ttl ? ttl * 1000 : undefined,
    });
  }

  async del(key: string): Promise<void> {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.del(key);
        return;
      }
    } catch (error) {
      this.logger.warn(`Redis del error: ${(error as Error).message}`);
    }
    this.memoryCache.delete(key);
  }

  async has(key: string): Promise<boolean> {
    try {
      if (this.useRedis && this.redisClient) {
        return (await this.redisClient.exists(key)) === 1;
      }
    } catch {
      // Fall through to memory cache
    }
    return this.memoryCache.has(key);
  }

  async clear(): Promise<void> {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.flushDb();
        return;
      }
    } catch {
      // Fall through to memory cache
    }
    this.memoryCache.clear();
  }
}
