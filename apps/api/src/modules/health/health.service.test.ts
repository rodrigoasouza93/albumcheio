import { describe, expect, it } from 'vitest';

import { HealthService } from './health.service.js';

describe('HealthService', () => {
  it('returns the API health response', () => {
    const service = new HealthService();

    expect(service.getHealth()).toEqual({
      status: 'ok',
      service: 'api'
    });
  });
});
