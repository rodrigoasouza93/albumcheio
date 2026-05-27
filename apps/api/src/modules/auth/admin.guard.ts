import { ForbiddenException, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

import { MetricsService } from '../observability/metrics.service.js';
import { StructuredLoggerService } from '../observability/structured-logger.service.js';
import type { AuthenticatedUser } from './auth.types.js';

interface RequestWithUser {
  readonly user?: AuthenticatedUser;
}

@Injectable()
export class AdminGuard implements CanActivate {
  public constructor(
    private readonly metricsService: MetricsService,
    private readonly logger: StructuredLoggerService
  ) {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (request.user?.role !== 'admin') {
      const user = request.user;

      this.metricsService.recordCatalogAuthorizationDenial({
        resource: 'catalog',
        action: 'admin_access',
        role: user?.role ?? 'anonymous'
      });

      if (user) {
        this.logger.logCatalogAuthorizationDenial({
          userId: user.id,
          role: user.role,
          resource: 'catalog',
          action: 'admin_access',
          outcome: 'denied'
        });
      }

      throw new ForbiddenException('Administrator access is required');
    }

    return true;
  }
}
