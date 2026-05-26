import { Module } from '@nestjs/common';

import { MetricsController } from './metrics.controller.js';
import { MetricsService } from './metrics.service.js';
import { RequestObservabilityMiddleware } from './request-observability.middleware.js';
import { StructuredLoggerService } from './structured-logger.service.js';

@Module({
  controllers: [MetricsController],
  providers: [
    MetricsService,
    RequestObservabilityMiddleware,
    StructuredLoggerService
  ],
  exports: [
    MetricsService,
    RequestObservabilityMiddleware,
    StructuredLoggerService
  ]
})
export class ObservabilityModule {}
