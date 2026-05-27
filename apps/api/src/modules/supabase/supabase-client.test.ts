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

  it('queries collection stickers with pagination and section filters', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          'content-type': 'application/json'
        }
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    await createClient().listCollectionStickers({
      albumId: 'album-id',
      sectionId: 'section-id',
      limit: 25,
      offset: 50
    });

    const requestedUrl = String(fetchMock.mock.calls[0]?.[0] ?? '');

    expect(requestedUrl).toContain('/rest/v1/stickers?');
    expect(requestedUrl).toContain('album_id=eq.album-id');
    expect(requestedUrl).toContain('section_id=eq.section-id');
    expect(requestedUrl).toContain('limit=25');
    expect(requestedUrl).toContain('offset=50');
  });

  it('queries collection items by sticker identifiers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          'content-type': 'application/json'
        }
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    await createClient().listCollectionItemsByStickerIds({
      userId: 'user-id',
      stickerIds: ['sticker-a', 'sticker-b']
    });

    const requestedUrl = String(fetchMock.mock.calls[0]?.[0] ?? '');

    expect(requestedUrl).toContain('/rest/v1/collection_items?');
    expect(requestedUrl).toContain('user_id=eq.user-id');
    expect(requestedUrl).toContain('sticker_id=in.%28sticker-a%2Csticker-b%29');
  });
});
