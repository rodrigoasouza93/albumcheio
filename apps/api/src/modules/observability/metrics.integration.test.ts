import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../app.module.js';
import { MetricsController } from './metrics.controller.js';
import { MetricsService } from './metrics.service.js';

describe('metrics endpoint', () => {
  let app: INestApplication;
  let metricsController: MetricsController;
  let metricsService: MetricsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    metricsController = moduleRef.get(MetricsController);
    metricsService = moduleRef.get(MetricsService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('exposes Prometheus text metrics', () => {
    metricsService.recordHttpRequest({
      method: 'GET',
      route: '/api/v1/health',
      statusCode: 200,
      durationSeconds: 0.01
    });

    const response = metricsController.getMetrics();

    expect(response).toContain('# TYPE http_requests_total counter');
    expect(response).toContain(
      'http_requests_total{method="GET",route="/api/v1/health",status_code="200"} 1'
    );
  });
});
