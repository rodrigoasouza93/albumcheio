import { Controller, Get, Header, Inject } from '@nestjs/common';

import { MetricsService } from './metrics.service.js';

@Controller('metrics')
export class MetricsController {
  public constructor(
    @Inject(MetricsService)
    private readonly metricsService: MetricsService
  ) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  public getMetrics(): string {
    return `${this.metricsService.renderPrometheusMetrics()}\n`;
  }
}
