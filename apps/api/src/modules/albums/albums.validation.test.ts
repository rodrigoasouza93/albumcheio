import { UnprocessableEntityException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import {
  normalizeCatalogCode,
  parseCreateAlbumSectionInput,
  parsePageQuery
} from './albums.validation.js';

describe('album catalog validation', () => {
  it('normalizes catalog codes by trimming and uppercasing', () => {
    expect(normalizeCatalogCode(' fwc01 ')).toBe('FWC01');
  });

  it('validates pagination limits and offsets', () => {
    expect(parsePageQuery({ limit: '10', offset: '20' })).toEqual({
      limit: 10,
      offset: 20
    });

    expect(() => parsePageQuery({ limit: '101', offset: '0' })).toThrow(
      UnprocessableEntityException
    );
  });

  it('parses album sections with normalized code and default sort order', () => {
    const input = parseCreateAlbumSectionInput(
      {
        name: 'Brazil',
        code: ' bra ',
        kind: 'team'
      },
      '00000000-0000-4000-8000-000000000001',
      'access-token'
    );

    expect(input).toEqual({
      accessToken: 'access-token',
      albumId: '00000000-0000-4000-8000-000000000001',
      name: 'Brazil',
      code: 'BRA',
      kind: 'team',
      sortOrder: 0
    });
  });
});
