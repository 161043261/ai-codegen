import { Module, Global } from "@nestjs/common";
import { AiModelMetricsCollector } from "./ai-model-metrics-collector";
import { AiModelMonitorListener } from "./ai-model-monitor-listener";
import { MetricsController } from "./metrics.controller";

@Global()
@Module({
  controllers: [MetricsController],
  providers: [AiModelMetricsCollector, AiModelMonitorListener],
  exports: [AiModelMetricsCollector, AiModelMonitorListener],
})
export class MonitorModule {}
