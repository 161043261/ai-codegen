package com.github.tianchenghang.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.annotation.Resource;
import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
@ConditionalOnProperty(name = "spring.redis.enabled", havingValue = "true", matchIfMissing = true)
@Slf4j
public class RedisCacheManagerConfig {
  @Resource private RedisConnectionFactory redisConnectionFactory;

  @Bean
  @Primary
  public CacheManager cacheManager() {
    log.info("Using Redis cache manager");
    var objectMapper = new ObjectMapper();
    objectMapper.registerModule(new JavaTimeModule());

    var defaultConfig =
        RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(30)) // Default 30 minute cache TTL
            .disableCachingNullValues() // Disable null value caching
            // Use String serialization for keys
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new StringRedisSerializer()));
    return RedisCacheManager.builder(redisConnectionFactory)
        .cacheDefaults(defaultConfig)
        .withCacheConfiguration("awesome_app_page", defaultConfig.entryTtl(Duration.ofMinutes(5)))
        .build();
  }
}
