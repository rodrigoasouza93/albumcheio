import { ForbiddenException, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

import type { AuthenticatedUser } from './auth.types.js';

interface RequestWithUser {
  readonly user?: AuthenticatedUser;
}

@Injectable()
export class AdminGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (request.user?.role !== 'admin') {
      throw new ForbiddenException('Administrator access is required');
    }

    return true;
  }
}
