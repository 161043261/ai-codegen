package com.github.tianchenghang.rate_limiter.limiter;

public interface RateLimiter {

  /**
   * Try to acquire a token
   *
   * @param key Rate limit key
   * @param rate Rate, number of requests allowed per time window
   * @param rateInterval Time window in seconds
   * @return Whether acquisition was successful
   */
  boolean tryAcquire(String key, long rate, long rateInterval);
}
