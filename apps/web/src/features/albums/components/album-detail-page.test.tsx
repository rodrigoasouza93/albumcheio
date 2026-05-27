import { fireEvent, render, screen } from '@testing-library/react';
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
    role: 'admin',
    email: 'ada@example.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
};

const userSession = {
  ...storedSession,
  user: {
    ...storedSession.user,
    role: 'user'
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
              status: 'published',
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
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              items: [
                {
                  id: 'sticker-id',
                  albumId: 'album-id',
                  sectionId: 'section-id',
                  code: 'BRA01',
                  number: 1,
                  title: 'Badge',
                  sortOrder: 10,
                  createdAt: '2026-01-01T00:00:00.000Z',
                  updatedAt: '2026-01-01T00:00:00.000Z'
                }
              ],
              limit: 100,
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
        <AlbumDetailPage albumId="album-id" />
      </SessionProvider>
    );

    expect(
      await screen.findByRole('heading', { name: 'World Cup 2026' })
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Brazil' })).toBeVisible();
    expect(screen.getByText('BRA01')).toBeVisible();
    expect(screen.getByText('Time')).toBeVisible();
    expect(screen.getByText('Status: Publicado')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Despublicar' })).toBeVisible();
  });

  it('creates sections and stickers without reloading the page', async () => {
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
            id: 'album-id',
            name: 'World Cup 2026',
            edition: 'Panini',
            description: 'Main tournament album',
            status: 'draft',
            createdBy: 'user-id',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            sections: []
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
            items: [],
            limit: 100,
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
            id: 'section-id',
            albumId: 'album-id',
            name: 'Brazil',
            code: 'BRA',
            kind: 'team',
            sortOrder: 10,
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
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 'sticker-id',
            albumId: 'album-id',
            sectionId: 'section-id',
            code: 'BRA01',
            number: 1,
            title: 'Badge',
            sortOrder: 10,
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
        <AlbumDetailPage albumId="album-id" />
      </SessionProvider>
    );

    expect(
      await screen.findByRole('heading', { name: 'World Cup 2026' })
    ).toBeVisible();

    fireEvent.change(screen.getByLabelText('Nome da seção'), {
      target: { value: 'Brazil' }
    });
    fireEvent.change(screen.getByLabelText('Código da seção'), {
      target: { value: 'bra' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar seção' }));

    expect(
      await screen.findByRole('heading', { name: 'Brazil' })
    ).toBeVisible();

    fireEvent.change(screen.getByLabelText('Código da figurinha'), {
      target: { value: 'bra01' }
    });
    fireEvent.change(screen.getByLabelText('Número'), {
      target: { value: '1' }
    });
    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Badge' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar figurinha' }));

    expect(await screen.findByText('BRA01')).toBeVisible();
  });

  it('shows a specific duplicate sticker code message', async () => {
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
            status: 'published',
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
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              items: [],
              limit: 100,
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
          new Response(JSON.stringify({ message: 'Resource already exists' }), {
            status: 409,
            headers: {
              'content-type': 'application/json'
            }
          })
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

    fireEvent.change(screen.getByLabelText('Código da figurinha'), {
      target: { value: 'bra01' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar figurinha' }));

    expect(
      await screen.findByText(
        'O código BRA01 já existe neste álbum. Revise o código ou escolha outro.'
      )
    ).toBeVisible();
  });

  it('hides catalog forms and shows collection controls for regular users', async () => {
    localStorage.setItem('albumcheio.session', JSON.stringify(userSession));
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify(userSession.user), {
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
              status: 'published',
              createdBy: 'user-id',
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z',
              sections: []
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
              items: [],
              limit: 100,
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
        <AlbumDetailPage albumId="album-id" />
      </SessionProvider>
    );

    expect(
      await screen.findByRole('heading', { name: 'World Cup 2026' })
    ).toBeVisible();
    expect(screen.queryByLabelText('Nome da seção')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Publicar' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Coleção' })).toBeVisible();
  });

  it('publishes draft albums from the admin controls', async () => {
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
            id: 'album-id',
            name: 'World Cup 2026',
            edition: 'Panini',
            description: 'Main tournament album',
            status: 'draft',
            createdBy: 'user-id',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            sections: []
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
            items: [],
            limit: 100,
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
            id: 'album-id',
            name: 'World Cup 2026',
            edition: 'Panini',
            description: 'Main tournament album',
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

    render(
      <SessionProvider>
        <AlbumDetailPage albumId="album-id" />
      </SessionProvider>
    );

    expect(await screen.findByText('Status: Rascunho')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }));

    expect(await screen.findByText('Status: Publicado')).toBeVisible();
    expect(fetchMock).toHaveBeenLastCalledWith(
      'http://localhost:3001/api/v1/albums/album-id/status',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          status: 'published'
        })
      })
    );
  });
});
