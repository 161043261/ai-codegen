package com.github.tianchenghang.rate_limiter.limiter;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicLong;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RedissonClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnMissingBean(RedissonClient.class)
@Slf4j
public class LocalRateLimiter implements RateLimiter {
  private static class RateLimitEntry {
    volatile long windowStart;
    final AtomicLong count;
    final long rate;
    final long windowSize;

    RateLimitEntry(long windowStart, AtomicLong count, long rate, long windowSize) {
      this.windowStart = windowStart;
      this.count = count;
      this.rate = rate;
      this.windowSize = windowSize;
    }
  }

  private final Cache<String, RateLimitEntry> rateLimitCache;

  public LocalRateLimiter() {
    log.info("Redis 不可用, 使用本地限流器");
    this.rateLimitCache =
        Caffeine.newBuilder().maximumSize(100_000).expireAfterWrite(Duration.ofHours(1)).build();
  }

  @Override
  public boolean tryAcquire(String key, long rate, long rateInterval) {
    var now = System.currentTimeMillis();
    var windowSize = rateInterval * 1000;
    var entry =
        rateLimitCache.get(key, k -> new RateLimitEntry(now, new AtomicLong(0), rate, windowSize));
    synchronized (entry) {
      if (now - entry.windowStart > entry.windowSize) {
        entry.windowStart = now;
        entry.count.set(0);
      }
      if (entry.count.get() >= entry.rate) {
        return false;
      }
      entry.count.incrementAndGet();
      return true;
    }
  }
}
