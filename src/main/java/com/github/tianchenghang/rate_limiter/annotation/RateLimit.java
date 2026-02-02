package com.github.tianchenghang.rate_limiter.annotation;

import com.github.tianchenghang.rate_limiter.enums.RateLimitType;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {

  // Rate limit key prefix
  String key() default "";

  // Rate, number of requests allowed per time window
  int rate() default 10;

  // Time window in seconds
  int rateInterval() default 1;

  // Rate limit type
  RateLimitType limitType() default RateLimitType.USER;

  // Rate limit message
  String message() default "Request rate limit exceeded";
}
