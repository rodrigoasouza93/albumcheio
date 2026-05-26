import { afterEach, describe, expect, it, vi } from 'vitest';

import { SupabaseClient } from './supabase-client.js';

const createClient = (): SupabaseClient =>
  new SupabaseClient({
    baseUrl: 'https://example.supabase.co',
    apiKey: 'anon-key',
    authorizationToken: 'access-token'
  });

describe('SupabaseClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes the direct auth user REST response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            id: 'user-id',
            email: 'user@example.com',
            user_metadata: {
              name: 'Rodrigo Souza'
            }
          }),
          {
            status: 200,
            headers: {
              'content-type': 'application/json'
            }
          }
        )
      )
    );

    const payload = await createClient().getAuthenticatedUser();

    expect(payload).toEqual({
      user: {
        id: 'user-id',
        email: 'user@example.com',
        user_metadata: {
          name: 'Rodrigo Souza'
        }
      }
    });
  });

  it('keeps wrapped auth user responses compatible', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            user: {
              id: 'user-id',
              email: 'user@example.com'
            }
          }),
          {
            status: 200,
            headers: {
              'content-type': 'application/json'
            }
          }
        )
      )
    );

    const payload = await createClient().getAuthenticatedUser();

    expect(payload.user.id).toBe('user-id');
  });
});
