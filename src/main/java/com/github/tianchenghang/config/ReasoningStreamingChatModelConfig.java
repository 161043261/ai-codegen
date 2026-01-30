package com.github.tianchenghang.config;

import jakarta.annotation.Resource;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "langchain4j.open-ai.reasoning-streaming-chat-model")
@Data
public class ReasoningStreamingChatModelConfig {
  @Resource
//  private AiModelMonitorListener aiModelMonitorListener;

  private String baseUrl;

  private String apiKey;

  private String modelName;

  private Integer maxTokens;

  private Double temperature;

  private Boolean logRequests = false;

  private Boolean logResponses = false;
}
