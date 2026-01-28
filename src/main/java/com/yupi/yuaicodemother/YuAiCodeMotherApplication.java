package com.yupi.yuaicodemother;

import dev.langchain4j.community.store.embedding.redis.spring.RedisEmbeddingStoreAutoConfiguration;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

/**
 * 启动类
 *
 * <p>Redis 可选配置说明： - 默认启用 Redis（spring.redis.enabled=true） - 禁用 Redis 时使用
 * profile：spring.profiles.active=local,no-redis - 禁用后自动降级：缓存使用 Caffeine，限流使用本地限流器，对话记忆使用内存存储
 */
@EnableCaching
@SpringBootApplication(exclude = {RedisEmbeddingStoreAutoConfiguration.class})
@MapperScan("com.yupi.yuaicodemother.mapper")
public class YuAiCodeMotherApplication {

  public static void main(String[] args) {
    SpringApplication.run(YuAiCodeMotherApplication.class, args);
  }
}
