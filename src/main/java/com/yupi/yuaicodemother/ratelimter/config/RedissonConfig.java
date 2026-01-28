package com.yupi.yuaicodemother.ratelimter.config;

import lombok.extern.slf4j.Slf4j;
import org.redisson.Redisson;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;
import org.redisson.config.SingleServerConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Redisson 配置 仅当 Redis 启用时生效 */
@Configuration
@ConditionalOnProperty(name = "spring.redis.enabled", havingValue = "true", matchIfMissing = true)
@Slf4j
public class RedissonConfig {

  @Value("${spring.data.redis.host}")
  private String redisHost;

  @Value("${spring.data.redis.port}")
  private Integer redisPort;

  @Value("${spring.data.redis.password}")
  private String redisPassword;

  @Value("${spring.data.redis.database}")
  private Integer redisDatabase;

  @Bean
  public RedissonClient redissonClient() {
    log.info("创建 Redisson 客户端连接 Redis: {}:{}", redisHost, redisPort);
    Config config = new Config();
    String address = "redis://" + redisHost + ":" + redisPort;
    SingleServerConfig singleServerConfig =
        config
            .useSingleServer()
            .setAddress(address)
            .setDatabase(redisDatabase)
            .setConnectionMinimumIdleSize(1)
            .setConnectionPoolSize(10)
            .setIdleConnectionTimeout(30000)
            .setConnectTimeout(5000)
            .setTimeout(3000)
            .setRetryAttempts(3)
            .setRetryInterval(1500);
    // 如果有密码则设置密码
    if (redisPassword != null && !redisPassword.isEmpty()) {
      singleServerConfig.setPassword(redisPassword);
    }
    return Redisson.create(config);
  }
}
