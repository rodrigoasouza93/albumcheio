import type { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import type { SupabaseClient } from '../supabase/supabase-client.js';
import { SupabaseApiError } from '../supabase/supabase-api.error.js';
import type { SupabaseService } from '../supabase/supabase.service.js';
import { SupabaseAuthGuard } from './supabase-auth.guard.js';

const createContext = (request: {
  headers: Record<string, string | undefined>;
  user?: unknown;
}): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => request
    })
  }) as unknown as ExecutionContext;

describe('SupabaseAuthGuard', () => {
  it('attaches the authenticated user to the request', async () => {
    const request = {
      headers: {
        authorization: 'Bearer user-token'
      }
    };
    const userClient = {
      getAuthenticatedUser: vi.fn().mockResolvedValue({
        user: {
          id: 'user-id',
          email: 'user@example.com',
          user_metadata: {
            name: 'Rodrigo Souza'
          }
        }
      })
    } as unknown as SupabaseClient;
    const supabaseService = {
      createUserClient: vi.fn().mockReturnValue(userClient)
    } as unknown as SupabaseService;
    const guard = new SupabaseAuthGuard(supabaseService);

    const isAllowed = await guard.canActivate(createContext(request));

    expect(isAllowed).toBe(true);
    expect(request).toEqual({
      headers: {
        authorization: 'Bearer user-token'
      },
      user: {
        id: 'user-id',
        email: 'user@example.com',
        name: 'Rodrigo Souza',
        accessToken: 'user-token'
      }
    });
  });

  it('rejects requests without bearer tokens', async () => {
    const guard = new SupabaseAuthGuard({
      createUserClient: vi.fn()
    } as unknown as SupabaseService);

    await expect(
      guard.canActivate(createContext({ headers: {} }))
    ).rejects.toThrow(UnauthorizedException);
  });

  it('maps Supabase token failures to unauthorized errors', async () => {
    const userClient = {
      getAuthenticatedUser: vi
        .fn()
        .mockRejectedValue(new SupabaseApiError(401, 'jwt expired'))
    } as unknown as SupabaseClient;
    const guard = new SupabaseAuthGuard({
      createUserClient: vi.fn().mockReturnValue(userClient)
    } as unknown as SupabaseService);

    await expect(
      guard.canActivate(
        createContext({
          headers: {
            authorization: 'Bearer expired'
          }
        })
      )
    ).rejects.toThrow(UnauthorizedException);
  });
});
