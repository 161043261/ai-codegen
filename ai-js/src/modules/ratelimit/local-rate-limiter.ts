import { Injectable, Logger } from "@nestjs/common";
import { RateLimiter } from "./ratelimit.interface";

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

/**
 * 本地限流器
 * 使用令牌桶算法实现本地限流
 */
@Injectable()
export class LocalRateLimiter implements RateLimiter {
  private readonly logger = new Logger(LocalRateLimiter.name);
  private readonly buckets: Map<string, TokenBucket> = new Map();

  /**
   * 清理过期的桶（每 5 分钟清理一次）
   */
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // 定期清理过期的限流桶
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000,
    );
  }

  /**
   * 清理过期的限流桶
   */
  private cleanup(): void {
    const now = Date.now();
    const expireTime = 10 * 60 * 1000; // 10 分钟过期

    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > expireTime) {
        this.buckets.delete(key);
      }
    }

    this.logger.debug(`清理限流桶，剩余 ${this.buckets.size} 个`);
  }

  /**
   * 获取或创建令牌桶
   */
  private getBucket(
    key: string,
    limit: number,
    windowSeconds: number,
  ): TokenBucket {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = {
        tokens: limit,
        lastRefill: now,
      };
      this.buckets.set(key, bucket);
      return bucket;
    }

    // 计算需要补充的令牌
    const timePassed = now - bucket.lastRefill;
    const refillRate = limit / (windowSeconds * 1000); // 每毫秒补充的令牌数
    const tokensToAdd = timePassed * refillRate;

    bucket.tokens = Math.min(limit, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    return bucket;
  }

  /**
   * 尝试获取令牌
   */
  async tryAcquire(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<boolean> {
    const bucket = this.getBucket(key, limit, windowSeconds);

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }

    this.logger.warn(`限流触发: ${key}`);
    return false;
  }

  /**
   * 获取剩余请求数
   */
  async getRemaining(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<number> {
    const bucket = this.getBucket(key, limit, windowSeconds);
    return Math.floor(bucket.tokens);
  }

  /**
   * 销毁时清理定时器
   */
  onModuleDestroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
