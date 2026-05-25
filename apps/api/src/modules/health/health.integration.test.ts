import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../app.module.js';
import { HealthController } from './health.controller.js';

describe('Health endpoint', () => {
  let app: INestApplication;
  let healthController: HealthController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    healthController = moduleRef.get(HealthController);
  });

  afterAll(async () => {
    await app.close();
  });

  it('responds with API health status', () => {
    const payload = healthController.getHealth();

    expect(payload).toEqual({
      status: 'ok',
      service: 'api'
    });
  });
});
