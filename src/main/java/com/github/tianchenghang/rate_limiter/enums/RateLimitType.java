package com.github.tianchenghang.rate_limiter.enums;

public enum RateLimitType {
  // 接口级别限流
  API,
  // 用户级别限流
  USER,
  // IP 级别限流
  IP
}
