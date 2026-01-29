import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RateLimiter } from "./ratelimit.interface";
import Redis from "ioredis";

/**
 * Redis 限流器
 * 使用 Redis 实现分布式限流（滑动窗口算法）
 */
@Injectable()
export class RedisRateLimiter implements RateLimiter, OnModuleDestroy {
  private readonly logger = new Logger(RedisRateLimiter.name);
  private redis: Redis | null = null;
  private available = false;

  constructor(private configService: ConfigService) {
    this.initRedis();
  }

  /**
   * 初始化 Redis 连接
   */
  private initRedis(): void {
    // Check if Redis is explicitly disabled
    const redisEnabled = this.configService.get("REDIS_ENABLED");
    if (redisEnabled === "false" || redisEnabled === false) {
      this.logger.log(
        "Redis disabled by configuration, using local rate limiter",
      );
      return;
    }

    const redisHost = this.configService.get<string>("REDIS_HOST");
    const redisPort = this.configService.get<number>("REDIS_PORT") || 6379;
    const redisPassword = this.configService.get<string>("REDIS_PASSWORD");

    if (!redisHost) {
      this.logger.log("Redis host not configured, using local rate limiter");
      return;
    }

    try {
      this.redis = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword || undefined,
        connectTimeout: 5000,
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            this.logger.warn(
              "Redis connection failed after 3 retries, falling back to local rate limiter",
            );
            this.fallbackToLocal();
            return null; // Stop retrying
          }
          const delay = Math.min(times * 500, 2000);
          this.logger.log(
            `Redis reconnect attempt ${times}/3, next retry in ${delay}ms...`,
          );
          return delay;
        },
        lazyConnect: false,
      });

      this.redis.on("error", (err) => {
        if (this.available) {
          this.logger.warn(
            `Redis error: ${err.message}, switching to local rate limiter`,
          );
          this.fallbackToLocal();
        }
      });

      this.redis.on("connect", () => {
        this.available = true;
        this.logger.log("Redis rate limiter connected");
      });

      this.redis.on("close", () => {
        if (this.available) {
          this.logger.warn("Redis connection closed, using local rate limiter");
          this.available = false;
        }
      });
    } catch (error) {
      this.logger.warn(
        `Redis initialization failed: ${(error as Error).message}, using local rate limiter`,
      );
      this.fallbackToLocal();
    }
  }

  /**
   * Fallback to local rate limiter
   */
  private fallbackToLocal(): void {
    this.available = false;
    if (this.redis) {
      try {
        this.redis.disconnect();
      } catch {
        // Ignore disconnect errors
      }
      this.redis = null;
    }
  }

  /**
   * 检查 Redis 是否可用
   */
  isAvailable(): boolean {
    return (
      this.available && this.redis !== null && this.redis.status === "ready"
    );
  }

  /**
   * 尝试获取令牌（滑动窗口算法）
   */
  async tryAcquire(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<boolean> {
    if (!this.isAvailable()) {
      this.logger.warn("Redis 不可用，跳过限流检查");
      return true;
    }

    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;
    const redisKey = `ratelimit:${key}`;

    try {
      // 使用 Redis 事务执行滑动窗口算法
      const pipeline = this.redis!.pipeline();

      // 移除窗口外的旧记录
      pipeline.zremrangebyscore(redisKey, 0, windowStart);

      // 获取当前窗口内的请求数
      pipeline.zcard(redisKey);

      // 添加当前请求
      pipeline.zadd(redisKey, now, `${now}-${Math.random()}`);

      // 设置过期时间
      pipeline.expire(redisKey, windowSeconds + 1);

      const results = await pipeline.exec();

      // 获取当前请求数（第二个命令的结果）
      const currentCount = results?.[1]?.[1] as number;

      if (currentCount >= limit) {
        // 超过限制，移除刚添加的请求
        await this.redis!.zremrangebyscore(redisKey, now, now);
        this.logger.warn(
          `限流触发: ${key}, 当前请求数: ${currentCount}, 限制: ${limit}`,
        );
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Redis 限流检查失败: ${(error as Error).message}`);
      return true; // 发生错误时放行
    }
  }

  /**
   * 获取剩余请求数
   */
  async getRemaining(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<number> {
    if (!this.isAvailable()) {
      return limit;
    }

    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;
    const redisKey = `ratelimit:${key}`;

    try {
      // 移除过期记录并获取当前计数
      await this.redis!.zremrangebyscore(redisKey, 0, windowStart);
      const currentCount = await this.redis!.zcard(redisKey);
      return Math.max(0, limit - currentCount);
    } catch (error) {
      this.logger.error(`获取剩余请求数失败: ${(error as Error).message}`);
      return limit;
    }
  }

  /**
   * 销毁时关闭 Redis 连接
   */
  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      try {
        this.redis.disconnect();
      } catch {
        // Ignore disconnect errors
      }
      this.redis = null;
    }
  }
}
