import { afterEach, describe, expect, it, vi } from 'vitest';

import { listAlbums, requestApi, updateAlbumStatus } from './http-client';

describe('http client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends bearer token and query parameters', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [],
          limit: 50,
          offset: 0
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    await listAlbums({
      token: 'access-token',
      limit: 50,
      offset: 0
    });

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Headers;

    expect(url).toBe('http://localhost:3001/api/v1/albums?limit=50&offset=0');
    expect(headers.get('authorization')).toBe('Bearer access-token');
  });

  it('maps API validation errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: 'Validation failed',
            errors: ['email must be valid']
          }),
          {
            status: 422,
            headers: {
              'content-type': 'application/json'
            }
          }
        )
      )
    );

    await expect(requestApi('/auth/login')).rejects.toMatchObject({
      status: 422,
      message: 'Validation failed',
      details: ['email must be valid']
    });
  });

  it('sends administrative album status updates', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'album-id',
          name: 'World Cup 2026',
          edition: null,
          description: null,
          status: 'published',
          createdBy: 'user-id',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z'
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    await updateAlbumStatus({
      token: 'access-token',
      albumId: 'album-id',
      status: {
        status: 'published'
      }
    });

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Headers;

    expect(url).toBe('http://localhost:3001/api/v1/albums/album-id/status');
    expect(options.method).toBe('PATCH');
    expect(headers.get('authorization')).toBe('Bearer access-token');
    expect(options.body).toBe(JSON.stringify({ status: 'published' }));
  });
});
