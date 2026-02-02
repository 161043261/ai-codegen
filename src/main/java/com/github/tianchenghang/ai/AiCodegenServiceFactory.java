package com.github.tianchenghang.ai;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.tianchenghang.ai.guardrail.PromptSafeInputGuardrail;
import com.github.tianchenghang.ai.tools.ToolManager;
import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import com.github.tianchenghang.model.enums.CodegenType;
import com.github.tianchenghang.service.ChatHistoryService;
import com.github.tianchenghang.utils.SpringContextUtil;
import dev.langchain4j.data.message.ToolExecutionResultMessage;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.store.memory.chat.ChatMemoryStore;
import jakarta.annotation.Resource;
import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class AiCodegenServiceFactory {

  @Resource(name = "openAiChatModel")
  private ChatModel chatModel;

  @Resource private ChatMemoryStore chatMemoryStore;

  @Resource private ChatHistoryService chatHistoryService;

  @Resource private ToolManager toolManager;

  private final Cache<String, AiCodegenService> serviceCache =
      Caffeine.newBuilder()
          .maximumSize(1000)
          .expireAfterWrite(Duration.ofMinutes(30))
          .expireAfterAccess(Duration.ofMinutes(10))
          .removalListener(
              (key, value, cause) -> {
                log.debug("AI service instance removed, cache key: {}, reason: {}", key, cause);
              })
          .build();

  public AiCodegenService getAiCodegenService(long appId) {
    return getAiCodegenService(appId, CodegenType.VANILLA_HTML);
  }

  public AiCodegenService getAiCodegenService(long appId, CodegenType codegenType) {
    var cacheKey = buildCacheKey(appId, codegenType);
    return serviceCache.get(cacheKey, key -> createAiCodegenService(appId, codegenType));
  }

  private AiCodegenService createAiCodegenService(long appId, CodegenType codegenType) {
    log.info("Creating new AI service instance for app ID: {}", appId);
    var chatMemory =
        MessageWindowChatMemory.builder()
            .id(appId)
            .chatMemoryStore(chatMemoryStore)
            .maxMessages(20)
            .build();
    chatHistoryService.loadChatHistory2memory(appId, chatMemory, 20);
    return switch (codegenType) {
      case VITE_PROJECT -> {
        var reasoningStreamingChatModel =
            SpringContextUtil.getBean(
                "reasoningStreamingChatModelPrototype", StreamingChatModel.class);
        yield AiServices.builder(AiCodegenService.class)
            .chatModel(chatModel)
            .streamingChatModel(reasoningStreamingChatModel)
            .chatMemoryProvider(memoryId -> chatMemory)
            .tools(toolManager.getAllTools())
            .hallucinatedToolNameStrategy(
                toolExecutionRequest ->
                    ToolExecutionResultMessage.from(
                        toolExecutionRequest,
                        "Error: no tool called " + toolExecutionRequest.name()))
            .maxSequentialToolsInvocations(20) // Maximum 20 sequential tool invocations
            .inputGuardrails(new PromptSafeInputGuardrail()) // Input guardrail
            // .outputGuardrails(new RetryOutputGuardrail()) // Output guardrail, not used for streaming output
            .build();
      }
      case VANILLA_HTML, MULTI_FILES -> {
        var openAiStreamingChatModel =
            SpringContextUtil.getBean("streamingChatModelPrototype", StreamingChatModel.class);
        yield AiServices.builder(AiCodegenService.class)
            .chatModel(chatModel)
            .streamingChatModel(openAiStreamingChatModel)
            .chatMemory(chatMemory)
            .inputGuardrails(new PromptSafeInputGuardrail())
            // .outputGuardrails(new RetryOutputGuardrail())
            .build();
      }
      default -> {
        throw new BusinessException(
            ErrorCode.INTERNAL_SERVER_ERROR, "Unsupported codegen type: " + codegenType.getValue());
      }
    };
  }

  @Bean
  public AiCodegenService aiCodegenService() {
    return getAiCodegenService(0);
  }

  private String buildCacheKey(long appId, CodegenType codeGenType) {
    return appId + "_" + codeGenType.getValue();
  }
}
