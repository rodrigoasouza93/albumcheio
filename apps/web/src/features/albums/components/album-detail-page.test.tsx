import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SessionProvider } from '@web/features/auth/hooks/session-context';

import { AlbumDetailPage } from './album-detail-page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn()
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

describe('AlbumDetailPage', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders album sections', async () => {
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
              id: 'album-id',
              name: 'World Cup 2026',
              edition: 'Panini',
              description: 'Main tournament album',
              status: 'active',
              createdBy: 'user-id',
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z',
              sections: [
                {
                  id: 'section-id',
                  albumId: 'album-id',
                  name: 'Brazil',
                  code: 'BRA',
                  kind: 'team',
                  sortOrder: 10,
                  createdAt: '2026-01-01T00:00:00.000Z',
                  updatedAt: '2026-01-01T00:00:00.000Z'
                }
              ]
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
        <AlbumDetailPage albumId="album-id" />
      </SessionProvider>
    );

    expect(
      await screen.findByRole('heading', { name: 'World Cup 2026' })
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Brazil' })).toBeVisible();
    expect(screen.getByText('Code BRA · team')).toBeVisible();
  });
});
