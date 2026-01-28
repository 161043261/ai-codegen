import { SetMetadata } from "@nestjs/common";
import { RateLimitType } from "./ratelimit.interface";

export const RATE_LIMIT_KEY = "rate_limit";

/**
 * 限流配置选项
 */
export interface RateLimitOptions {
  /** 限流类型 */
  type?: RateLimitType;
  /** 时间窗口内允许的请求数 */
  limit?: number;
  /** 时间窗口（秒） */
  windowSeconds?: number;
  /** 限流 key 前缀 */
  keyPrefix?: string;
  /** 被限流时的提示消息 */
  message?: string;
}

/**
 * 限流装饰器
 * @param options 限流配置选项
 *
 * @example
 * // 每分钟最多 10 次请求（IP 限流）
 * @RateLimit({ type: RateLimitType.IP, limit: 10, windowSeconds: 60 })
 *
 * // 每秒最多 5 次请求（用户限流）
 * @RateLimit({ type: RateLimitType.USER, limit: 5, windowSeconds: 1 })
 */
export const RateLimit = (options: RateLimitOptions = {}) => {
  const config: RateLimitOptions = {
    type: options.type ?? RateLimitType.IP,
    limit: options.limit ?? 100,
    windowSeconds: options.windowSeconds ?? 60,
    keyPrefix: options.keyPrefix ?? "",
    message: options.message ?? "请求过于频繁，请稍后再试",
  };
  return SetMetadata(RATE_LIMIT_KEY, config);
};
