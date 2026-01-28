import { Injectable, Logger } from "@nestjs/common";
import { Counter, Histogram, Registry } from "prom-client";

/**
 * AI 模型指标采集器
 * 使用 Prometheus 客户端收集 AI 调用相关指标
 */
@Injectable()
export class AiModelMetricsCollector {
  private readonly logger = new Logger(AiModelMetricsCollector.name);
  private readonly registry: Registry;

  // 请求计数器
  private readonly requestCounter: Counter;

  // 错误计数器
  private readonly errorCounter: Counter;

  // 响应时间直方图
  private readonly responseTimeHistogram: Histogram;

  // Token 使用计数器
  private readonly tokenUsageCounter: Counter;

  constructor() {
    this.registry = new Registry();

    // 初始化请求计数器
    this.requestCounter = new Counter({
      name: "ai_model_requests_total",
      help: "AI 模型请求总数",
      labelNames: ["user_id", "app_id", "model_name", "status"],
      registers: [this.registry],
    });

    // 初始化错误计数器
    this.errorCounter = new Counter({
      name: "ai_model_errors_total",
      help: "AI 模型错误总数",
      labelNames: ["user_id", "app_id", "model_name", "error_type"],
      registers: [this.registry],
    });

    // 初始化响应时间直方图
    this.responseTimeHistogram = new Histogram({
      name: "ai_model_response_time_seconds",
      help: "AI 模型响应时间（秒）",
      labelNames: ["user_id", "app_id", "model_name"],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120],
      registers: [this.registry],
    });

    // 初始化 Token 使用计数器
    this.tokenUsageCounter = new Counter({
      name: "ai_model_tokens_total",
      help: "AI 模型 Token 使用总数",
      labelNames: ["user_id", "app_id", "model_name", "token_type"],
      registers: [this.registry],
    });

    this.logger.log("AI 模型指标采集器已初始化");
  }

  /**
   * 记录请求
   */
  recordRequest(
    userId: string | undefined,
    appId: string | undefined,
    modelName: string,
    status: "started" | "success" | "error",
  ): void {
    this.requestCounter.inc({
      user_id: userId || "anonymous",
      app_id: appId || "unknown",
      model_name: modelName,
      status,
    });
  }

  /**
   * 记录错误
   */
  recordError(
    userId: string | undefined,
    appId: string | undefined,
    modelName: string,
    errorType: string,
  ): void {
    this.errorCounter.inc({
      user_id: userId || "anonymous",
      app_id: appId || "unknown",
      model_name: modelName,
      error_type: this.normalizeErrorType(errorType),
    });
  }

  /**
   * 记录响应时间
   */
  recordResponseTime(
    userId: string | undefined,
    appId: string | undefined,
    modelName: string,
    durationMs: number,
  ): void {
    this.responseTimeHistogram.observe(
      {
        user_id: userId || "anonymous",
        app_id: appId || "unknown",
        model_name: modelName,
      },
      durationMs / 1000, // 转换为秒
    );
  }

  /**
   * 记录 Token 使用
   */
  recordTokenUsage(
    userId: string | undefined,
    appId: string | undefined,
    modelName: string,
    tokenType: "input" | "output" | "total",
    count: number,
  ): void {
    this.tokenUsageCounter.inc(
      {
        user_id: userId || "anonymous",
        app_id: appId || "unknown",
        model_name: modelName,
        token_type: tokenType,
      },
      count,
    );
  }

  /**
   * 获取指标注册表
   */
  getRegistry(): Registry {
    return this.registry;
  }

  /**
   * 获取指标数据（Prometheus 格式）
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * 标准化错误类型
   */
  private normalizeErrorType(errorMessage: string): string {
    const message = errorMessage.toLowerCase();

    if (message.includes("timeout")) {
      return "timeout";
    }
    if (message.includes("rate limit") || message.includes("429")) {
      return "rate_limit";
    }
    if (
      message.includes("auth") ||
      message.includes("401") ||
      message.includes("403")
    ) {
      return "authentication";
    }
    if (message.includes("network") || message.includes("connection")) {
      return "network";
    }
    if (message.includes("invalid") || message.includes("400")) {
      return "invalid_request";
    }

    return "unknown";
  }
}
