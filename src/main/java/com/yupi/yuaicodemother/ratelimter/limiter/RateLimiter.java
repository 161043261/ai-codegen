package com.yupi.yuaicodemother.ratelimter.limiter;

/** 限流器接口 */
public interface RateLimiter {

  /**
   * 尝试获取令牌
   *
   * @param key 限流键
   * @param rate 速率（每个时间窗口允许的请求数）
   * @param rateInterval 时间窗口（秒）
   * @return 是否获取成功
   */
  boolean tryAcquire(String key, long rate, long rateInterval);
}
