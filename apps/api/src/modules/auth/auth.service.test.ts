import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import type { SupabaseClient } from '../supabase/supabase-client.js';
import { SupabaseApiError } from '../supabase/supabase-api.error.js';
import type { SupabaseService } from '../supabase/supabase.service.js';
import type { ProfilesService } from '../profiles/profiles.service.js';
import type { MetricsService } from '../observability/metrics.service.js';
import { AuthService } from './auth.service.js';

const profile = {
  id: 'user-id',
  name: 'Rodrigo',
  createdAt: '2026-05-25T10:00:00.000Z',
  updatedAt: '2026-05-25T10:00:00.000Z'
};

const sessionPayload = {
  user: {
    id: 'user-id',
    email: 'user@example.com'
  },
  session: {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    expires_in: 3600,
    token_type: 'bearer'
  }
};

const createMetricsService = (): MetricsService => {
  const recordAuthFailure = vi.fn();

  return {
    recordAuthFailure
  } as unknown as MetricsService;
};

describe('AuthService', () => {
  it('registers a Supabase user and creates a profile', async () => {
    const authClient = {
      signUp: vi.fn().mockResolvedValue(sessionPayload)
    } as unknown as SupabaseClient;
    const supabaseService = {
      createAuthClient: vi.fn().mockReturnValue(authClient)
    } as unknown as SupabaseService;
    const createProfile = vi.fn().mockResolvedValue(profile);
    const profilesService = {
      createProfile
    } as unknown as ProfilesService;
    const service = new AuthService(
      supabaseService,
      profilesService,
      createMetricsService()
    );

    const response = await service.register({
      name: 'Rodrigo',
      email: 'user@example.com',
      password: '12345678'
    });

    expect(response).toEqual({
      user: {
        ...profile,
        email: 'user@example.com'
      },
      session: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        tokenType: 'bearer'
      }
    });
    expect(createProfile).toHaveBeenCalledWith({
      userId: 'user-id',
      name: 'Rodrigo',
      accessToken: 'access-token'
    });
  });

  it('rejects registration when Supabase requires email confirmation', async () => {
    const authClient = {
      signUp: vi.fn().mockResolvedValue({
        user: {
          id: 'user-id',
          email: 'user@example.com'
        },
        session: null
      })
    } as unknown as SupabaseClient;
    const service = new AuthService(
      {
        createAuthClient: vi.fn().mockReturnValue(authClient)
      } as unknown as SupabaseService,
      {
        createProfile: vi.fn()
      } as unknown as ProfilesService,
      createMetricsService()
    );

    await expect(
      service.register({
        name: 'Rodrigo',
        email: 'user@example.com',
        password: '12345678'
      })
    ).rejects.toThrow(ForbiddenException);
  });

  it('maps login failures to unauthorized errors', async () => {
    const authClient = {
      signInWithPassword: vi
        .fn()
        .mockRejectedValue(new SupabaseApiError(401, 'bad password'))
    } as unknown as SupabaseClient;
    const service = new AuthService(
      {
        createAuthClient: vi.fn().mockReturnValue(authClient)
      } as unknown as SupabaseService,
      {
        getProfile: vi.fn()
      } as unknown as ProfilesService,
      createMetricsService()
    );

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'wrong-password'
      })
    ).rejects.toThrow(UnauthorizedException);
  });

  it('creates a missing profile on login after email confirmation', async () => {
    const authClient = {
      signInWithPassword: vi.fn().mockResolvedValue({
        ...sessionPayload,
        user: {
          ...sessionPayload.user,
          user_metadata: {
            name: 'Rodrigo Souza'
          }
        }
      })
    } as unknown as SupabaseClient;
    const getOrCreateProfile = vi.fn().mockResolvedValue(profile);
    const service = new AuthService(
      {
        createAuthClient: vi.fn().mockReturnValue(authClient)
      } as unknown as SupabaseService,
      {
        getOrCreateProfile
      } as unknown as ProfilesService,
      createMetricsService()
    );

    await service.login({
      email: 'user@example.com',
      password: '12345678'
    });

    expect(getOrCreateProfile).toHaveBeenCalledWith({
      userId: 'user-id',
      name: 'Rodrigo Souza',
      accessToken: 'access-token'
    });
  });
});
