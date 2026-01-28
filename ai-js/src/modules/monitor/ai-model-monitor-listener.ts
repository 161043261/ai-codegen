import { Injectable, Logger } from "@nestjs/common";
import { AiModelMetricsCollector } from "./ai-model-metrics-collector";
import { MonitorContextHolder, MonitorContext } from "./monitor-context";

/**
 * Token 使用信息
 */
export interface TokenUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

/**
 * AI 模型监听器
 * 监听 AI 模型调用的生命周期事件
 */
@Injectable()
export class AiModelMonitorListener {
  private readonly logger = new Logger(AiModelMonitorListener.name);

  constructor(private readonly metricsCollector: AiModelMetricsCollector) {}

  /**
   * 请求开始时调用
   */
  onRequest(modelName: string, context?: Partial<MonitorContext>): void {
    const monitorContext = MonitorContextHolder.getContext();
    const userId = context?.userId || monitorContext.userId;
    const appId = context?.appId || monitorContext.appId;

    // 更新上下文
    MonitorContextHolder.setContext({
      ...monitorContext,
      modelName,
      startTime: Date.now(),
      userId,
      appId,
    });

    // 记录请求开始
    this.metricsCollector.recordRequest(userId, appId, modelName, "started");
    this.logger.debug(
      `AI 请求开始 - Model: ${modelName}, User: ${userId}, App: ${appId}`,
    );
  }

  /**
   * 请求成功时调用
   */
  onResponse(modelName: string, tokenUsage?: TokenUsage): void {
    const monitorContext = MonitorContextHolder.getContext();
    const userId = monitorContext.userId;
    const appId = monitorContext.appId;
    const startTime = monitorContext.startTime;

    // 记录成功
    this.metricsCollector.recordRequest(userId, appId, modelName, "success");

    // 记录响应时间
    if (startTime) {
      const duration = Date.now() - startTime;
      this.metricsCollector.recordResponseTime(
        userId,
        appId,
        modelName,
        duration,
      );
      this.logger.debug(
        `AI 请求完成 - Model: ${modelName}, Duration: ${duration}ms`,
      );
    }

    // 记录 Token 使用
    if (tokenUsage) {
      if (tokenUsage.inputTokens) {
        this.metricsCollector.recordTokenUsage(
          userId,
          appId,
          modelName,
          "input",
          tokenUsage.inputTokens,
        );
      }
      if (tokenUsage.outputTokens) {
        this.metricsCollector.recordTokenUsage(
          userId,
          appId,
          modelName,
          "output",
          tokenUsage.outputTokens,
        );
      }
      if (tokenUsage.totalTokens) {
        this.metricsCollector.recordTokenUsage(
          userId,
          appId,
          modelName,
          "total",
          tokenUsage.totalTokens,
        );
      }
    }
  }

  /**
   * 请求失败时调用
   */
  onError(modelName: string, error: Error): void {
    const monitorContext = MonitorContextHolder.getContext();
    const userId = monitorContext.userId;
    const appId = monitorContext.appId;
    const startTime = monitorContext.startTime;

    // 记录错误
    this.metricsCollector.recordRequest(userId, appId, modelName, "error");
    this.metricsCollector.recordError(userId, appId, modelName, error.message);

    // 记录响应时间（即使是错误）
    if (startTime) {
      const duration = Date.now() - startTime;
      this.metricsCollector.recordResponseTime(
        userId,
        appId,
        modelName,
        duration,
      );
    }

    this.logger.error(
      `AI 请求失败 - Model: ${modelName}, Error: ${error.message}`,
    );
  }

  /**
   * 流式响应 chunk 时调用（用于流式监控）
   */
  onStreamChunk(modelName: string, chunkSize: number): void {
    // 可以在这里记录流式传输的指标
    this.logger.debug(
      `AI 流式响应 - Model: ${modelName}, ChunkSize: ${chunkSize}`,
    );
  }
}
