import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';

import { Inject, Injectable } from '@nestjs/common';
import type { NestMiddleware } from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/auth.types.js';
import { MetricsService } from './metrics.service.js';
import { StructuredLoggerService } from './structured-logger.service.js';

interface ObservableRequest {
  readonly method: string;
  readonly originalUrl?: string;
  readonly url?: string;
  readonly baseUrl?: string;
  readonly route?: {
    readonly path?: string;
  };
  readonly headers: Record<string, string | readonly string[] | undefined>;
  user?: AuthenticatedUser;
}

interface ObservableResponse {
  readonly statusCode: number;
  setHeader(name: string, value: string): void;
  on(event: 'finish', listener: () => void): void;
}

type NextFunction = () => void;

@Injectable()
export class RequestObservabilityMiddleware implements NestMiddleware {
  public constructor(
    @Inject(MetricsService)
    private readonly metricsService: MetricsService,
    @Inject(StructuredLoggerService)
    private readonly logger: StructuredLoggerService
  ) {}

  public use(
    request: ObservableRequest,
    response: ObservableResponse,
    next: NextFunction
  ): void {
    const startedAt = performance.now();
    const requestId = this.getRequestId(request);

    response.setHeader('x-request-id', requestId);
    response.on('finish', () => {
      const durationMs = performance.now() - startedAt;
      const route = this.getRoute(request);

      this.metricsService.recordHttpRequest({
        method: request.method,
        route,
        statusCode: response.statusCode,
        durationSeconds: durationMs / 1000
      });
      this.logger.logRequest({
        requestId,
        method: request.method,
        route,
        statusCode: response.statusCode,
        durationMs,
        userId: request.user?.id
      });
    });

    next();
  }

  private getRequestId(request: ObservableRequest): string {
    const requestId = request.headers['x-request-id'];

    if (typeof requestId === 'string' && requestId.trim().length > 0) {
      return requestId;
    }

    if (Array.isArray(requestId)) {
      const firstRequestId: unknown = requestId[0];

      if (typeof firstRequestId === 'string' && firstRequestId.length > 0) {
        return firstRequestId;
      }
    }

    return randomUUID();
  }

  private getRoute(request: ObservableRequest): string {
    const routePath = request.route?.path;

    if (routePath) {
      return `${request.baseUrl ?? ''}${routePath}`.replace(/\/+/g, '/');
    }

    return (request.originalUrl ?? request.url ?? 'unknown').split('?')[0] ?? 'unknown';
  }
}
