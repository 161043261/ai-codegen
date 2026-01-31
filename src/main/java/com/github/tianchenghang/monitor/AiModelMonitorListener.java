package com.github.tianchenghang.monitor;

import dev.langchain4j.model.chat.listener.ChatModelListener;
import dev.langchain4j.model.chat.listener.ChatModelRequestContext;
import dev.langchain4j.model.chat.listener.ChatModelResponseContext;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;

@Component
public class AiModelMonitorListener implements ChatModelListener {
  private static final String REQUEST_START_TIME_KEY = "request-start-time";
  private static final String MONITOR_CONTEXT_KEY = "monitor-context";

  @Resource private AiModelMetricsCollector aiModelMetricsCollector;

  @Override
  public void onRequest(ChatModelRequestContext requestContext) {
    requestContext.attributes().put(REQUEST_START_TIME_KEY, Instant.now());
    var monitorContext = MonitorContextHolder.getContext();
    var userId = monitorContext.getUserId();
    var appId = monitorContext.getAppId();
    requestContext.attributes().put(MONITOR_CONTEXT_KEY, monitorContext);
    var modelName = requestContext.chatRequest().modelName();
    aiModelMetricsCollector.recordRequest(userId, appId, modelName, AiModelStatus.STARTED.name());
  }

  @Override
  public void onResponse(ChatModelResponseContext responseContext) {
    var attributes = responseContext.attributes();
    var monitorContext = (MonitorContext) attributes.get(MONITOR_CONTEXT_KEY);
    var userId = monitorContext.getUserId();
    var appId = monitorContext.getAppId();
    var modelName = responseContext.chatResponse().modelName();
    aiModelMetricsCollector.recordRequest(userId, appId, modelName, AiModelStatus.SUCCESS.name());
    recordResponseTime(attributes, userId, appId, modelName);
    recordTokenUsage(responseContext, userId, appId, modelName);
  }

  private void recordResponseTime(
      Map<Object, Object> attributes, String userId, String appId, String modelName) {
    var startTime = (Instant) attributes.get(REQUEST_START_TIME_KEY);
    var responseTime = Duration.between(startTime, Instant.now());
    aiModelMetricsCollector.recordResponseTime(userId, appId, modelName, responseTime);
  }

  private void recordTokenUsage(
      ChatModelResponseContext responseContext, String userId, String appId, String modelName) {
    var tokenUsage = responseContext.chatResponse().tokenUsage();
    if (tokenUsage != null) {
      aiModelMetricsCollector.recordTokenUsage(
          userId, appId, modelName, TokenType.INPUT.name(), tokenUsage.inputTokenCount());
      aiModelMetricsCollector.recordTokenUsage(
          userId, appId, modelName, TokenType.OUTPUT.name(), tokenUsage.outputTokenCount());
      aiModelMetricsCollector.recordTokenUsage(
          userId, appId, modelName, TokenType.TOTAL.name(), tokenUsage.totalTokenCount());
    }
  }
}
