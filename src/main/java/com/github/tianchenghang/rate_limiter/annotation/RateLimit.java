package com.github.tianchenghang.rate_limiter.annotation;

import com.github.tianchenghang.rate_limiter.enums.RateLimitType;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {

  // 限流键前缀
  String key() default "";

  // 速率, 每个时间窗口允许的请求数
  int rate() default 10;

  // 时间窗口, 单位 s
  int rateInterval() default 1;

  // 限流类型
  RateLimitType limitType() default RateLimitType.USER;

  // 限流提示信息
  String message() default "请求过于频繁";
}
