import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SessionProvider } from '@web/features/auth/hooks/session-context';

import { AlbumsPage } from './albums-page';

const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: replaceMock
  })
}));

const storedSession = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  expiresIn: 3600,
  tokenType: 'bearer',
  user: {
    id: 'user-id',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
};

describe('AlbumsPage', () => {
  afterEach(() => {
    localStorage.clear();
    replaceMock.mockClear();
    vi.restoreAllMocks();
  });

  it('loads albums for the authenticated session', async () => {
    localStorage.setItem('albumcheio.session', JSON.stringify(storedSession));
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify(storedSession.user), {
            status: 200,
            headers: {
              'content-type': 'application/json'
            }
          })
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              items: [
                {
                  id: 'album-id',
                  name: 'World Cup 2026',
                  edition: 'Panini',
                  description: 'Main tournament album',
                  status: 'active',
                  createdBy: 'user-id',
                  createdAt: '2026-01-01T00:00:00.000Z',
                  updatedAt: '2026-01-01T00:00:00.000Z'
                }
              ],
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
        )
    );

    render(
      <SessionProvider>
        <AlbumsPage />
      </SessionProvider>
    );

    expect(
      await screen.findByRole('heading', { name: 'World Cup 2026' })
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: /World Cup 2026/i })
    ).toHaveAttribute('href', '/albums/album-id');
    await waitFor(() => expect(replaceMock).not.toHaveBeenCalledWith('/'));
  });

  it('shows an empty state when no albums exist', async () => {
    localStorage.setItem('albumcheio.session', JSON.stringify(storedSession));
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify(storedSession.user), {
            status: 200,
            headers: {
              'content-type': 'application/json'
            }
          })
        )
        .mockResolvedValueOnce(
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
        )
    );

    render(
      <SessionProvider>
        <AlbumsPage />
      </SessionProvider>
    );

    expect(
      await screen.findByRole('heading', { name: 'No albums yet' })
    ).toBeVisible();
  });

  it('creates an album and updates the list', async () => {
    localStorage.setItem('albumcheio.session', JSON.stringify(storedSession));
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(storedSession.user), {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        })
      )
      .mockResolvedValueOnce(
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
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 'created-album-id',
            name: 'Copa America 2028',
            edition: 'Collectors',
            description: 'Manual catalog',
            status: 'active',
            createdBy: 'user-id',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z'
          }),
          {
            status: 201,
            headers: {
              'content-type': 'application/json'
            }
          }
        )
      );
    vi.stubGlobal('fetch', fetchMock);

    render(
      <SessionProvider>
        <AlbumsPage />
      </SessionProvider>
    );

    expect(
      await screen.findByRole('heading', { name: 'No albums yet' })
    ).toBeVisible();

    fireEvent.change(screen.getByLabelText('Album name'), {
      target: { value: 'Copa America 2028' }
    });
    fireEvent.change(screen.getByLabelText('Edition'), {
      target: { value: 'Collectors' }
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Manual catalog' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create album' }));

    expect(
      await screen.findByRole('heading', { name: 'Copa America 2028' })
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: /Copa America 2028/i })
    ).toHaveAttribute('href', '/albums/created-album-id');
    expect(fetchMock).toHaveBeenLastCalledWith(
      'http://localhost:3001/api/v1/albums',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'Copa America 2028',
          edition: 'Collectors',
          description: 'Manual catalog'
        })
      })
    );
  });
});
