import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { MetricsService } from './metrics.service';

@Controller('management')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('prometheus')
  async getMetrics(@Res() response: Response) {
    response.setHeader('Content-Type', this.metricsService.getContentType());
    response.send(await this.metricsService.getMetrics());
  }

  @Get('health')
  health() {
    return { status: 'UP' };
  }

  @Get('info')
  info() {
    return {
      app: { name: 'ai-codegen', version: '0.0.1' },
    };
  }
}
