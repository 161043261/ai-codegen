package com.github.tianchenghang.config;

import static org.slf4j.LoggerFactory.getLogger;

import com.github.benmanes.caffeine.cache.Caffeine;
import java.time.Duration;
import org.slf4j.Logger;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

// @Slf4j
@Configuration
@ConditionalOnProperty(name = "spring.redis.enabled", havingValue = "false", matchIfMissing = false)
public class CacheConfig {

  private static final Logger logger = getLogger(CacheConfig.class);

  @Bean
  @Primary
  public CacheManager cacheManager() {
    logger.info("Redis is disabled, use Caffeine local cache");
    var cacheManager = new CaffeineCacheManager();
    cacheManager.setCaffeine(
        Caffeine.newBuilder()
            .maximumSize(10_000)
            .expireAfterWrite(Duration.ofMinutes(30))
            .expireAfterAccess(Duration.ofMinutes(10)));
    return cacheManager;
  }
}
