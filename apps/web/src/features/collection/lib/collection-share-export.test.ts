import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildPrintableShareListHtml,
  formatShareListText,
  loadCompleteShareList
} from './collection-share-export';

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
const otherSection = {
  ...section,
  id: 'other-section-id',
  name: 'Argentina',
  code: 'ARG',
  sortOrder: 20
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

describe('collection share export', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(timestamp));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('loads every missing sticker page and omits sectionId for all sections', async () => {
    const fetchMock = vi.fn((url: string | URL | Request) => {
      const requestUrl = getRequestUrl(url);
      const offset = Number(requestUrl.searchParams.get('offset'));

      expect(requestUrl.pathname).toBe('/api/v1/albums/album-id/missing');
      expect(requestUrl.searchParams.get('sectionId')).toBeNull();
      expect(requestUrl.searchParams.get('limit')).toBe('100');

      return createJsonResponse({
        items:
          offset === 0
            ? Array.from({ length: 100 }, (_, index) => ({
                ...sticker,
                id: `sticker-${index}`,
                code: `BRA${String(index).padStart(2, '0')}`,
                quantityTotal: 0,
                owned: false
              }))
            : [
                {
                  ...sticker,
                  id: 'last-sticker',
                  sectionId: 'other-section-id',
                  code: 'ARG01',
                  title: null,
                  quantityTotal: 0,
                  owned: false
                }
              ],
        limit: 100,
        offset
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const shareList = await loadCompleteShareList({
      token: 'access-token',
      albumId: 'album-id',
      sectionId: 'all',
      kind: 'missing',
      sections: [section, otherSection]
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(shareList).toMatchObject({
      kind: 'missing',
      sectionName: 'Todas as seções',
      generatedAt: timestamp
    });
    expect(shareList.items).toHaveLength(101);
    expect(shareList.items[100]).toEqual({
      code: 'ARG01',
      title: 'Figurinha sem título',
      sectionName: 'Argentina'
    });
  });

  it('formats duplicates without personal data or duplicate quantities', () => {
    const text = formatShareListText({
      kind: 'duplicates',
      sectionName: 'Brazil',
      generatedAt: timestamp,
      items: [
        {
          code: 'BRA01',
          title: 'Badge',
          sectionName: 'Brazil'
        }
      ]
    });

    expect(text).toContain('Lista de figurinhas repetidas');
    expect(text).toContain('BRA01 - Badge - Brazil');
    expect(text).not.toContain('duplicateCount');
    expect(text).not.toContain('disponíveis');
    expect(text).not.toContain('user');
    expect(text).not.toContain('email');
  });

  it('escapes printable HTML content', () => {
    const html = buildPrintableShareListHtml({
      kind: 'missing',
      sectionName: 'Brazil',
      generatedAt: timestamp,
      items: [
        {
          code: 'BRA<01>',
          title: 'Badge & Captain',
          sectionName: 'Brazil'
        }
      ]
    });

    expect(html).toContain('BRA&lt;01&gt;');
    expect(html).toContain('Badge &amp; Captain');
    expect(html).not.toContain('BRA<01>');
  });
});
