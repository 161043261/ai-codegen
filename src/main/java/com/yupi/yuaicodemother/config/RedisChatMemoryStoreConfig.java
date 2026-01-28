package com.yupi.yuaicodemother.config;

import cn.hutool.core.util.StrUtil;
import dev.langchain4j.community.store.memory.chat.redis.RedisChatMemoryStore;
import dev.langchain4j.store.memory.chat.ChatMemoryStore;
import dev.langchain4j.store.memory.chat.InMemoryChatMemoryStore;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** 对话记忆存储配置 支持 Redis 和内存两种模式 */
@Configuration
@ConfigurationProperties(prefix = "spring.data.redis")
@Data
@Slf4j
public class RedisChatMemoryStoreConfig {

  private String host;

  private int port;

  private String password;

  private long ttl;

  /** Redis 对话记忆存储 仅当 Redis 启用时生效 */
  @Bean
  @ConditionalOnProperty(name = "spring.redis.enabled", havingValue = "true", matchIfMissing = true)
  public ChatMemoryStore redisChatMemoryStore() {
    log.info("使用 Redis 对话记忆存储");
    RedisChatMemoryStore.Builder builder =
        RedisChatMemoryStore.builder().host(host).port(port).password(password).ttl(ttl);
    if (StrUtil.isNotBlank(password)) {
      builder.user("default");
    }
    return builder.build();
  }

  /** 内存对话记忆存储 当 Redis 禁用时使用 */
  @Bean
  @ConditionalOnProperty(
      name = "spring.redis.enabled",
      havingValue = "false",
      matchIfMissing = false)
  public ChatMemoryStore inMemoryChatMemoryStore() {
    log.info("Redis 已禁用，使用内存对话记忆存储");
    return new InMemoryChatMemoryStore();
  }
}
