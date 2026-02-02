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
                log.debug("AI 服务实例被移除, 缓存键: {}, 原因: {}", key, cause);
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
    log.info("为应用 ID: {} 创建新的 AI 服务实例", appId);
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
            .maxSequentialToolsInvocations(20) // 最多连续调用 20 次工具
            .inputGuardrails(new PromptSafeInputGuardrail()) // 输入护轨
            // .outputGuardrails(new RetryOutputGuardrail()) // 输出护轨, 流式输出不使用输出护轨
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
            ErrorCode.INTERNAL_SERVER_ERROR, "不支持的代码生成类型: " + codegenType.getValue());
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
