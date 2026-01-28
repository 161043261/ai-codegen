import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RateLimiter } from "./ratelimit.interface";
import Redis from "ioredis";

/**
 * Redis 限流器
 * 使用 Redis 实现分布式限流（滑动窗口算法）
 */
@Injectable()
export class RedisRateLimiter implements RateLimiter {
  private readonly logger = new Logger(RedisRateLimiter.name);
  private redis: Redis | null = null;

  constructor(private configService: ConfigService) {
    this.initRedis();
  }

  /**
   * 初始化 Redis 连接
   */
  private initRedis(): void {
    const redisUrl = this.configService.get<string>("REDIS_URL");
    if (redisUrl) {
      try {
        this.redis = new Redis(redisUrl);
        this.redis.on("error", (err) => {
          this.logger.error(`Redis 连接错误: ${err.message}`);
        });
        this.redis.on("connect", () => {
          this.logger.log("Redis 连接成功");
        });
      } catch (error) {
        this.logger.error(`Redis 初始化失败: ${(error as Error).message}`);
      }
    } else {
      this.logger.warn("未配置 REDIS_URL，Redis 限流器不可用");
    }
  }

  /**
   * 检查 Redis 是否可用
   */
  isAvailable(): boolean {
    return this.redis !== null && this.redis.status === "ready";
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
      await this.redis.quit();
    }
  }
}
