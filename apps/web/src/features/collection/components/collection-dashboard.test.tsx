import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CollectionDashboard } from './collection-dashboard';

const timestamp = '2026-01-01T00:00:00.000Z';
const section = {
  id: 'section-id',
  albumId: 'album-id',
  name: 'Brazil',
  code: 'BRA',
  kind: 'team' as const,
  sortOrder: 10,
  createdAt: timestamp,
  updatedAt: timestamp
};
const sticker = {
  id: 'sticker-id',
  albumId: 'album-id',
  sectionId: 'section-id',
  code: 'BRA01',
  number: 1,
  title: 'Badge',
  sortOrder: 10,
  createdAt: timestamp,
  updatedAt: timestamp
};
const missingSticker = {
  id: 'missing-sticker-id',
  albumId: 'album-id',
  sectionId: 'section-id',
  code: 'BRA02',
  number: 2,
  title: 'Forward',
  sortOrder: 20,
  createdAt: timestamp,
  updatedAt: timestamp
};

const createJsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json'
    }
  });

const getRequestUrl = (url: string | URL | Request): URL => {
  if (typeof url === 'string') {
    return new URL(url);
  }

  if (url instanceof URL) {
    return url;
  }

  return new URL(url.url);
};

const parseQuantityTotal = (body: BodyInit | null | undefined): number => {
  if (typeof body !== 'string') {
    return 0;
  }

  const parsed = JSON.parse(body) as unknown;

  if (
    parsed &&
    typeof parsed === 'object' &&
    'quantityTotal' in parsed &&
    typeof parsed.quantityTotal === 'number'
  ) {
    return parsed.quantityTotal;
  }

  return 0;
};

describe('CollectionDashboard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders progress, statuses, missing stickers and repeated stickers', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string | URL | Request) => {
        const requestUrl = getRequestUrl(url);

        if (requestUrl.pathname.endsWith('/collection/search')) {
          const code = requestUrl.searchParams.get('code');

          return createJsonResponse({
            albumId: 'album-id',
            code,
            status: code === 'BRA01' ? 'duplicate' : 'missing',
            sticker: code === 'BRA01' ? sticker : missingSticker,
            quantityTotal: code === 'BRA01' ? 3 : 0,
            owned: code === 'BRA01',
            duplicateCount: code === 'BRA01' ? 2 : 0
          });
        }

        if (requestUrl.pathname.endsWith('/progress')) {
          return createJsonResponse({
            albumId: 'album-id',
            total: 2,
            owned: 1,
            missing: 1,
            percentage: 50,
            sections: [
              {
                sectionId: 'section-id',
                sectionCode: 'BRA',
                sectionName: 'Brazil',
                total: 2,
                owned: 1,
                missing: 1,
                percentage: 50
              }
            ]
          });
        }

        if (requestUrl.pathname.endsWith('/missing')) {
          expect(requestUrl.searchParams.get('limit')).toBe('100');

          return createJsonResponse({
            items: [{ ...missingSticker, quantityTotal: 0, owned: false }],
            limit: 100,
            offset: 0
          });
        }

        expect(requestUrl.searchParams.get('limit')).toBe('100');

        return createJsonResponse({
          items: [{ ...sticker, quantityTotal: 3, duplicateCount: 2 }],
          limit: 100,
          offset: 0
        });
      })
    );

    render(
      <CollectionDashboard
        albumId="album-id"
        sections={[section]}
        stickers={[sticker, missingSticker]}
        token="access-token"
        onUnauthorized={vi.fn()}
      />
    );

    expect((await screen.findAllByText('50%'))[0]).toBeVisible();
    expect(
      screen.getByText(/1 tenho, 1 faltando de 2 figurinhas/)
    ).toBeVisible();
    expect(screen.getAllByText('Repetida')[0]).toBeVisible();
    expect(screen.getAllByText('Faltando')[0]).toBeVisible();
    expect(screen.getByText('BRA02 · Forward')).toBeVisible();
    expect(screen.getByText('BRA01 · Badge')).toBeVisible();
    expect(screen.getByText('2 disponíveis')).toBeVisible();
  });

  it('searches for nonexistent codes and updates quantities', async () => {
    let quantityTotal = 2;
    const fetchMock = vi.fn(
      (url: string | URL | Request, init?: RequestInit) => {
        const requestUrl = getRequestUrl(url);

        if (requestUrl.pathname.endsWith('/collection-items/sticker-id')) {
          quantityTotal = parseQuantityTotal(init?.body);

          return createJsonResponse({
            id: 'item-id',
            userId: 'user-id',
            stickerId: 'sticker-id',
            quantityTotal,
            owned: quantityTotal > 0,
            duplicateCount: Math.max(quantityTotal - 1, 0),
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }

        if (requestUrl.pathname.endsWith('/collection/search')) {
          const code = requestUrl.searchParams.get('code');

          if (code === 'ZZZ99') {
            return createJsonResponse({
              albumId: 'album-id',
              code,
              status: 'not_found',
              sticker: null,
              quantityTotal: 0,
              owned: false,
              duplicateCount: 0
            });
          }

          return createJsonResponse({
            albumId: 'album-id',
            code,
            status: quantityTotal > 1 ? 'duplicate' : 'owned',
            sticker,
            quantityTotal,
            owned: quantityTotal > 0,
            duplicateCount: Math.max(quantityTotal - 1, 0)
          });
        }

        if (requestUrl.pathname.endsWith('/progress')) {
          return createJsonResponse({
            albumId: 'album-id',
            total: 1,
            owned: 1,
            missing: 0,
            percentage: 100,
            sections: [
              {
                sectionId: 'section-id',
                sectionCode: 'BRA',
                sectionName: 'Brazil',
                total: 1,
                owned: 1,
                missing: 0,
                percentage: 100
              }
            ]
          });
        }

        if (requestUrl.pathname.endsWith('/missing')) {
          return createJsonResponse({
            items: [],
            limit: 100,
            offset: 0
          });
        }

        return createJsonResponse({
          items:
            quantityTotal > 1
              ? [
                  {
                    ...sticker,
                    quantityTotal,
                    duplicateCount: quantityTotal - 1
                  }
                ]
              : [],
          limit: 100,
          offset: 0
        });
      }
    );
    vi.stubGlobal('fetch', fetchMock);

    render(
      <CollectionDashboard
        albumId="album-id"
        sections={[section]}
        stickers={[sticker]}
        token="access-token"
        onUnauthorized={vi.fn()}
      />
    );

    expect((await screen.findAllByText('100%'))[0]).toBeVisible();

    fireEvent.change(screen.getByLabelText('Código da figurinha'), {
      target: { value: 'ZZZ99' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(
      await screen.findByText('Não está neste álbum · ZZZ99')
    ).toBeVisible();

    const quantityInput = screen.getByDisplayValue('2');
    fireEvent.change(quantityInput, { target: { value: '1' } });

    expect(await screen.findByDisplayValue('1')).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/collection-items/sticker-id'),
      expect.objectContaining({
        method: 'PATCH'
      })
    );
    expect(
      within(
        screen.getByRole('heading', { name: 'Repetidas' }).parentElement!
      ).getByText('Nenhuma figurinha repetida neste filtro.')
    ).toBeVisible();
  });
});
