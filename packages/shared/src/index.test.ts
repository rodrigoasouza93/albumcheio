import { describe, expect, it } from 'vitest';

import { createHealthResponse } from './index';

describe('createHealthResponse', () => {
  it('creates a consistent health payload', () => {
    const response = createHealthResponse('api');

    expect(response).toEqual({
      status: 'ok',
      service: 'api'
    });
  });
});
