import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import type { SupabaseClient } from '../supabase/supabase-client.js';
import { SupabaseApiError } from '../supabase/supabase-api.error.js';
import type { SupabaseService } from '../supabase/supabase.service.js';
import { ProfilesService } from './profiles.service.js';

describe('ProfilesService', () => {
  it('reads a user profile through the JWT-scoped Supabase client', async () => {
    const userClient = {
      getProfile: vi.fn().mockResolvedValue({
        id: 'user-id',
        name: 'Rodrigo',
        role: 'admin',
        created_at: '2026-05-25T10:00:00.000Z',
        updated_at: '2026-05-25T10:00:00.000Z'
      })
    } as unknown as SupabaseClient;
    const service = new ProfilesService({
      createUserClient: vi.fn().mockReturnValue(userClient)
    } as unknown as SupabaseService);

    const profile = await service.getProfile({
      userId: 'user-id',
      accessToken: 'access-token'
    });

    expect(profile).toEqual({
      id: 'user-id',
      name: 'Rodrigo',
      role: 'admin',
      createdAt: '2026-05-25T10:00:00.000Z',
      updatedAt: '2026-05-25T10:00:00.000Z'
    });
  });

  it('maps missing profiles to not found errors', async () => {
    const userClient = {
      getProfile: vi
        .fn()
        .mockRejectedValue(new SupabaseApiError(404, 'Profile not found'))
    } as unknown as SupabaseClient;
    const service = new ProfilesService({
      createUserClient: vi.fn().mockReturnValue(userClient)
    } as unknown as SupabaseService);

    await expect(
      service.getProfile({
        userId: 'missing-user',
        accessToken: 'access-token'
      })
    ).rejects.toThrow(NotFoundException);
  });

  it('creates a missing profile for the authenticated user', async () => {
    const insertProfile = vi.fn().mockResolvedValue({
      id: 'user-id',
      name: 'Rodrigo',
      role: 'user',
      created_at: '2026-05-25T10:00:00.000Z',
      updated_at: '2026-05-25T10:00:00.000Z'
    });
    const userClient = {
      getProfile: vi
        .fn()
        .mockRejectedValue(new SupabaseApiError(404, 'Profile not found')),
      insertProfile
    } as unknown as SupabaseClient;
    const service = new ProfilesService({
      createUserClient: vi.fn().mockReturnValue(userClient)
    } as unknown as SupabaseService);

    const profile = await service.getOrCreateProfile({
      userId: 'user-id',
      name: 'Rodrigo',
      accessToken: 'access-token'
    });

    expect(profile.name).toBe('Rodrigo');
    expect(insertProfile).toHaveBeenCalledWith({
      id: 'user-id',
      name: 'Rodrigo'
    });
  });
});
