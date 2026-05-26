import { Test } from '@nestjs/testing';
import {
  UnprocessableEntityException,
  type INestApplication
} from '@nestjs/common';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { AppModule } from '../app.module.js';
import { ProfilesController } from '../profiles/profiles.controller.js';
import type { SupabaseClient } from '../supabase/supabase-client.js';
import { SupabaseService } from '../supabase/supabase.service.js';
import { AuthController } from './auth.controller.js';

const profileRow = {
  id: 'user-id',
  name: 'Rodrigo',
  created_at: '2026-05-25T10:00:00.000Z',
  updated_at: '2026-05-25T10:00:00.000Z'
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

describe('auth endpoints', () => {
  let app: INestApplication;
  let authController: AuthController;
  let profilesController: ProfilesController;
  const authClient = {
    signUp: vi.fn(),
    signInWithPassword: vi.fn()
  };
  const userClient = {
    getAuthenticatedUser: vi.fn(),
    signOut: vi.fn(),
    insertProfile: vi.fn(),
    getProfile: vi.fn()
  };
  const supabaseService = {
    createAuthClient: vi.fn(() => authClient as unknown as SupabaseClient),
    createUserClient: vi.fn(() => userClient as unknown as SupabaseClient),
    createAdminClient: vi.fn()
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(SupabaseService)
      .useValue(supabaseService)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    authController = moduleRef.get(AuthController);
    profilesController = moduleRef.get(ProfilesController);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    authClient.signUp.mockResolvedValue(sessionPayload);
    authClient.signInWithPassword.mockResolvedValue(sessionPayload);
    userClient.getAuthenticatedUser.mockResolvedValue({
      user: {
        id: 'user-id',
        email: 'user@example.com',
        user_metadata: {
          name: 'Rodrigo'
        }
      }
    });
    userClient.signOut.mockResolvedValue(undefined);
    userClient.insertProfile.mockResolvedValue(profileRow);
    userClient.getProfile.mockResolvedValue(profileRow);
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a user and creates the profile', async () => {
    const response = await authController.register({
      name: 'Rodrigo',
      email: 'user@example.com',
      password: '12345678'
    });

    expect(response).toEqual({
      user: {
        id: 'user-id',
        name: 'Rodrigo',
        email: 'user@example.com',
        createdAt: '2026-05-25T10:00:00.000Z',
        updatedAt: '2026-05-25T10:00:00.000Z'
      },
      session: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        tokenType: 'bearer'
      }
    });
  });

  it('logs in a user and returns the profile with session data', async () => {
    const response = await authController.login({
      email: 'user@example.com',
      password: '12345678'
    });

    expect(response.session.accessToken).toBe('access-token');
    expect(userClient.getProfile).toHaveBeenCalledWith('user-id');
  });

  it('logs out the bearer session', async () => {
    const response = await authController.logout({
      user: {
        id: 'user-id',
        email: 'user@example.com',
        name: 'Rodrigo',
        accessToken: 'access-token'
      }
    });

    expect(response).toEqual({
      success: true
    });
    expect(userClient.signOut).toHaveBeenCalledOnce();
  });

  it('returns the authenticated profile', async () => {
    const response = await profilesController.getAuthenticatedProfile({
      user: {
        id: 'user-id',
        email: 'user@example.com',
        name: 'Rodrigo',
        accessToken: 'access-token'
      }
    });

    expect(response).toEqual({
      id: 'user-id',
      name: 'Rodrigo',
      email: 'user@example.com',
      createdAt: '2026-05-25T10:00:00.000Z',
      updatedAt: '2026-05-25T10:00:00.000Z'
    });
  });

  it('returns 422 for invalid auth input', () => {
    expect(() =>
      authController.register({
        name: '',
        email: 'invalid',
        password: 'short'
      })
    ).toThrow(UnprocessableEntityException);
  });
});
