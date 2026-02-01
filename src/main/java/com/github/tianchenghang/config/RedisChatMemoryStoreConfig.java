package com.github.tianchenghang.config;

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

@Configuration
@ConfigurationProperties(prefix = "spring.data.redis")
@Data
@Slf4j
public class RedisChatMemoryStoreConfig {
  private String host;
  private int port;
  private String password;
  private long ttl;

  @Bean
  @ConditionalOnProperty(name = "spring.redis.enabled", havingValue = "true", matchIfMissing = true)
  public ChatMemoryStore redisChatMemoryStore() {
    log.info("使用 redis 保存对话上下文");
    var builder = RedisChatMemoryStore.builder().host(host).port(port).password(password).ttl(ttl);
    if (StrUtil.isNotBlank(password)) {
      builder.user("default");
    }
    return builder.build();
  }

  @Bean
  @ConditionalOnProperty(
      name = "spring.redis.enabled",
      havingValue = "false",
      matchIfMissing = false)
  public ChatMemoryStore inMemoryChatMemoryStore() {
    return new InMemoryChatMemoryStore();
  }
}
