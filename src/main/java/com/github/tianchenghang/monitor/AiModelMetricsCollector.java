package com.github.tianchenghang.monitor;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import javax.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class AiModelMetricsCollector {
  @Resource private MeterRegistry meterRegistry;
  private final ConcurrentMap<String, Counter> requestCountersCache = new ConcurrentHashMap<>();
  private final ConcurrentMap<String, Counter> errorCountersCache = new ConcurrentHashMap<>();
  private final ConcurrentMap<String, Counter> tokenCountersCache = new ConcurrentHashMap<>();
  private final ConcurrentMap<String, Timer> responseTimersCache = new ConcurrentHashMap<>();

  public void recordRequest(String userId, String appId, String modelName, String status) {
    var key = String.format("%s_%s_%s_%s", userId, appId, modelName, status);
    var counter =
        requestCountersCache.computeIfAbsent(
            key,
            k ->
                Counter.builder("Total request count")
                    .tag("user_id", userId)
                    .tag("app_id", appId)
                    .tag("model_name", modelName)
                    .tag("status", status)
                    .register(meterRegistry));
    counter.increment();
  }

  public void recordError(String userId, String appId, String modelName, String errorMessage) {
    var key = String.format("%s_%s_%s_%s", userId, appId, modelName, errorMessage);
    var counter =
        errorCountersCache.computeIfAbsent(
            key,
            k ->
                Counter.builder("Total error count")
                    .tag("user_id", userId)
                    .tag("app_id", appId)
                    .tag("model_name", modelName)
                    .tag("error_message", errorMessage)
                    .register(meterRegistry));
    counter.increment();
  }

  public void recordTokenUsage(
      String userId, String appId, String modelName, String tokenType, long tokenCount) {
    var key = String.format("%s_%s_%s_%s", userId, appId, modelName, tokenType);
    var counter =
        tokenCountersCache.computeIfAbsent(
            key,
            k ->
                Counter.builder("Total error count")
                    .tag("user_id", userId)
                    .tag("app_id", appId)
                    .tag("model_name", modelName)
                    .tag("token_type", tokenType)
                    .register(meterRegistry));
    counter.increment(tokenCount);
  }

  public void recordResponseTime(String userId, String appId, String modelName, Duration duration) {
    var key = String.format("%s_%s_%s", userId, appId, modelName);
    var timer =
        responseTimersCache.computeIfAbsent(
            key,
            k ->
                Timer.builder("Response duration seconds")
                    .tag("user_id", userId)
                    .tag("app_id", appId)
                    .tag("model_name", modelName)
                    .register(meterRegistry));
    timer.record(duration);
  }
}
