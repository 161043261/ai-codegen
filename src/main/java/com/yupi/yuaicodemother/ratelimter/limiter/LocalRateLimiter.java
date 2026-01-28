package com.yupi.yuaicodemother.ratelimter.limiter;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicLong;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RedissonClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

/** 基于 Caffeine 的本地限流器 当 Redis 不可用时使用此限流器 */
@Component
@ConditionalOnMissingBean(RedissonClient.class)
@Slf4j
public class LocalRateLimiter implements RateLimiter {

  /** 存储每个 key 的请求计数和时间窗口信息 */
  private final Cache<String, RateLimitEntry> rateLimitCache;

  public LocalRateLimiter() {
    log.info("Redis 不可用，使用本地限流器");
    this.rateLimitCache =
        Caffeine.newBuilder().maximumSize(100000).expireAfterWrite(Duration.ofHours(1)).build();
  }

  @Override
  public boolean tryAcquire(String key, long rate, long rateInterval) {
    long now = System.currentTimeMillis();
    long windowSize = rateInterval * 1000; // 转换为毫秒

    RateLimitEntry entry =
        rateLimitCache.get(key, k -> new RateLimitEntry(now, new AtomicLong(0), rate, windowSize));

    synchronized (entry) {
      // 检查是否需要重置时间窗口
      if (now - entry.windowStart > entry.windowSize) {
        entry.windowStart = now;
        entry.count.set(0);
      }

      // 检查是否超过限制
      if (entry.count.get() >= entry.rate) {
        return false;
      }

      // 增加计数
      entry.count.incrementAndGet();
      return true;
    }
  }

  /** 限流条目 */
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
}
