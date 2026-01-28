import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { AiModelMetricsCollector } from "./ai-model-metrics-collector";

/**
 * Prometheus 指标控制器
 */
@Controller("metrics")
export class MetricsController {
  constructor(private readonly metricsCollector: AiModelMetricsCollector) {}

  /**
   * 获取 Prometheus 指标
   */
  @Get()
  async getMetrics(@Res() res: Response): Promise<void> {
    const metrics = await this.metricsCollector.getMetrics();
    res.set("Content-Type", "text/plain");
    res.send(metrics);
  }
}
