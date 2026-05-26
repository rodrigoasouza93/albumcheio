import { describe, expect, it, vi } from 'vitest';

import type { MetricsService } from './metrics.service.js';
import { RequestObservabilityMiddleware } from './request-observability.middleware.js';
import type { StructuredLoggerService } from './structured-logger.service.js';

describe('RequestObservabilityMiddleware', () => {
  it('records metrics and structured logs when the response finishes', () => {
    const recordHttpRequest = vi.fn();
    const logRequest = vi.fn();
    let finishListener: (() => void) | null = null;
    const responseHeaders = new Map<string, string>();
    const middleware = new RequestObservabilityMiddleware(
      {
        recordHttpRequest
      } as unknown as MetricsService,
      {
        logRequest
      } as unknown as StructuredLoggerService
    );

    middleware.use(
      {
        method: 'GET',
        originalUrl: '/api/v1/albums/album-id/progress?debug=true',
        headers: {
          'x-request-id': 'request-id'
        },
        user: {
          id: 'user-id',
          email: 'user@example.com',
          name: 'Rodrigo',
          accessToken: 'access-token'
        }
      },
      {
        statusCode: 200,
        setHeader: (name, value) => responseHeaders.set(name, value),
        on: (_event, listener) => {
          finishListener = listener;
        }
      },
      vi.fn()
    );

    finishListener?.();

    expect(responseHeaders.get('x-request-id')).toBe('request-id');
    expect(recordHttpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        route: '/api/v1/albums/album-id/progress',
        statusCode: 200
      })
    );
    expect(logRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'request-id',
        route: '/api/v1/albums/album-id/progress',
        statusCode: 200,
        userId: 'user-id'
      })
    );
  });
});
