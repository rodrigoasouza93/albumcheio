import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service.js';
import { mapSupabaseError } from './supabase-error.mapper.js';
import type { AuthenticatedUser } from './auth.types.js';

interface RequestWithUser {
  readonly headers: Record<string, string | readonly string[] | undefined>;
  user?: AuthenticatedUser;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  public constructor(
    @Inject(SupabaseService)
    private readonly supabaseService: SupabaseService
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const accessToken = this.extractBearerToken(request);

    if (!accessToken) {
      throw new UnauthorizedException('Bearer token is required');
    }

    try {
      const payload = await this.supabaseService
        .createUserClient(accessToken)
        .getAuthenticatedUser();

      request.user = {
        id: payload.user.id,
        email: payload.user.email ?? null,
        name: payload.user.user_metadata?.name ?? null,
        accessToken
      };

      return true;
    } catch (error) {
      throw mapSupabaseError(error);
    }
  }

  private extractBearerToken(request: RequestWithUser): string | undefined {
    const headerValue = this.getAuthorizationHeader(
      request.headers.authorization
    );
    const [scheme, token] = headerValue?.split(' ') ?? [];

    return scheme === 'Bearer' && token ? token : undefined;
  }

  private getAuthorizationHeader(
    authorization: string | readonly string[] | undefined
  ): string | undefined {
    if (typeof authorization === 'string') {
      return authorization;
    }

    if (!Array.isArray(authorization)) {
      return undefined;
    }

    const headerValues: readonly unknown[] = authorization;
    const headerValue = headerValues[0];

    return typeof headerValue === 'string' ? headerValue : undefined;
  }
}
