package com.github.tianchenghang.rate_limiter.limiter;

import jakarta.annotation.Resource;
import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RateType;
import org.redisson.api.RedissonClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnBean(RedissonClient.class)
@Slf4j
public class RedisRateLimiter implements RateLimiter {
  @Resource private RedissonClient redissonClient;

  @Override
  public boolean tryAcquire(String key, long rate, long rateInterval) {
    var rateLimiter = redissonClient.getRateLimiter(key);
    rateLimiter.expire(Duration.ofHours(1));
    rateLimiter.trySetRate(RateType.OVERALL, rate, Duration.ofSeconds(rateInterval));
    return rateLimiter.tryAcquire(1);
  }
}
