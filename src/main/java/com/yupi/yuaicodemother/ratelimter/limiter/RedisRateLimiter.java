package com.yupi.yuaicodemother.ratelimter.limiter;

import jakarta.annotation.Resource;
import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RRateLimiter;
import org.redisson.api.RateIntervalUnit;
import org.redisson.api.RateType;
import org.redisson.api.RedissonClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Component;

/** 基于 Redis (Redisson) 的分布式限流器 */
@Component
@ConditionalOnBean(RedissonClient.class)
@Slf4j
public class RedisRateLimiter implements RateLimiter {

  @Resource private RedissonClient redissonClient;

  @Override
  public boolean tryAcquire(String key, long rate, long rateInterval) {
    RRateLimiter rateLimiter = redissonClient.getRateLimiter(key);
    rateLimiter.expire(Duration.ofHours(1)); // 1 小时后过期
    // 设置限流器参数：每个时间窗口允许的请求数和时间窗口
    rateLimiter.trySetRate(RateType.OVERALL, rate, rateInterval, RateIntervalUnit.SECONDS);
    // 尝试获取一个令牌
    return rateLimiter.tryAcquire(1);
  }
}
