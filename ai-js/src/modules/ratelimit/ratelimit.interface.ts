/**
 * 限流类型枚举
 */
export enum RateLimitType {
  /** 接口级别限流 */
  API = "api",
  /** 用户级别限流 */
  USER = "user",
  /** IP 级别限流 */
  IP = "ip",
}

/**
 * 限流配置接口
 */
export interface RateLimitConfig {
  /** 限流类型 */
  type: RateLimitType;
  /** 时间窗口内允许的请求数 */
  limit: number;
  /** 时间窗口（秒） */
  windowSeconds: number;
  /** 限流 key 前缀 */
  keyPrefix?: string;
  /** 被限流时的提示消息 */
  message?: string;
}

/**
 * 限流器接口
 */
export interface RateLimiter {
  /**
   * 尝试获取令牌
   * @param key 限流 key
   * @param limit 限制数量
   * @param windowSeconds 时间窗口（秒）
   * @returns 是否获取成功
   */
  tryAcquire(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<boolean>;

  /**
   * 获取剩余请求数
   * @param key 限流 key
   * @param limit 限制数量
   * @param windowSeconds 时间窗口（秒）
   */
  getRemaining(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<number>;
}
