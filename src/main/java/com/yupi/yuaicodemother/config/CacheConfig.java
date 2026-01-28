package com.yupi.yuaicodemother.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/** Caffeine 本地缓存配置 当 Redis 禁用时使用此配置 */
@Configuration
@ConditionalOnProperty(name = "spring.redis.enabled", havingValue = "false", matchIfMissing = false)
@Slf4j
public class CacheConfig {

  @Bean
  @Primary
  public CacheManager cacheManager() {
    log.info("Redis 已禁用，使用 Caffeine 本地缓存");
    CaffeineCacheManager cacheManager = new CaffeineCacheManager();
    cacheManager.setCaffeine(
        Caffeine.newBuilder()
            .maximumSize(10000)
            .expireAfterWrite(Duration.ofMinutes(30))
            .expireAfterAccess(Duration.ofMinutes(10)));
    return cacheManager;
  }
}
