package com.github.tianchenghang.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Slf4j
@Configuration
@ConditionalOnProperty(name = "spring.redis.enabled", havingValue = "false", matchIfMissing = false)
public class CacheConfig {

  @Bean
  @Primary
  public CacheManager cacheManager() {
    log.info("Redis is disabled, use Caffeine local cache");
    var cacheManager = new CaffeineCacheManager();
    cacheManager.setCaffeine(
        Caffeine.newBuilder()
            .maximumSize(10_000)
            .expireAfterWrite(Duration.ofMinutes(30))
            .expireAfterAccess(Duration.ofMinutes(10)));
    return cacheManager;
  }
}
