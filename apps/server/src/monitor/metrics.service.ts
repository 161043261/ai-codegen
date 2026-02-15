import { Injectable } from '@nestjs/common';
import promClient from 'prom-client';

@Injectable()
export class MetricsService {
  // private readonly logger = new Logger(MetricsService.name);
  private readonly registry: promClient.Registry;

  readonly aiRequestCounter: promClient.Counter;
  readonly aiErrorCounter: promClient.Counter;
  readonly aiTokenUsageCounter: promClient.Counter;
  readonly aiResponseTime: promClient.Histogram;

  constructor() {
    this.registry = new promClient.Registry();
    promClient.collectDefaultMetrics({ register: this.registry });

    this.aiRequestCounter = new promClient.Counter({
      name: 'ai_model_requests_total',
      help: 'Total AI model requests',
      labelNames: ['model', 'user_id', 'app_id', 'status'],
      registers: [this.registry],
    });

    this.aiErrorCounter = new promClient.Counter({
      name: 'ai_model_errors_total',
      help: 'Total AI model errors',
      labelNames: ['model', 'error_type'],
      registers: [this.registry],
    });

    this.aiTokenUsageCounter = new promClient.Counter({
      name: 'ai_model_token_usage_total',
      help: 'Total token usage',
      labelNames: ['model', 'type'],
      registers: [this.registry],
    });

    this.aiResponseTime = new promClient.Histogram({
      name: 'ai_model_response_duration_seconds',
      help: 'AI model response time',
      labelNames: ['model'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
      registers: [this.registry],
    });
  }

  recordRequest(
    model: string,
    userId: string,
    appId: string,
    status: string,
  ): void {
    this.aiRequestCounter.inc({
      model,
      user_id: userId,
      app_id: appId,
      status,
    });
  }

  recordError(model: string, errorType: string): void {
    this.aiErrorCounter.inc({ model, error_type: errorType });
  }

  recordTokenUsage(
    model: string,
    inputTokens: number,
    outputTokens: number,
  ): void {
    this.aiTokenUsageCounter.inc({ model, type: 'input' }, inputTokens);
    this.aiTokenUsageCounter.inc({ model, type: 'output' }, outputTokens);
  }

  recordResponseTime(model: string, durationSeconds: number): void {
    this.aiResponseTime.observe({ model }, durationSeconds);
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
