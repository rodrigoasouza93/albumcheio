import { UnprocessableEntityException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import {
  parseCreateStickerInput,
  parseStickerFilter
} from './stickers.validation.js';

const albumId = '00000000-0000-4000-8000-000000000001';
const sectionId = '00000000-0000-4000-8000-000000000101';

describe('sticker validation', () => {
  it('normalizes sticker codes before creating a sticker', () => {
    const input = parseCreateStickerInput(
      {
        sectionId,
        code: ' bra01 ',
        number: 1,
        title: 'Brazil Badge',
        sortOrder: 10
      },
      albumId,
      'access-token'
    );

    expect(input).toEqual({
      accessToken: 'access-token',
      albumId,
      sectionId,
      code: 'BRA01',
      number: 1,
      title: 'Brazil Badge',
      sortOrder: 10
    });
  });

  it('normalizes sticker code filters and keeps pagination', () => {
    expect(
      parseStickerFilter(
        {
          sectionId,
          code: ' fwc01 ',
          limit: '5',
          offset: '10'
        },
        albumId
      )
    ).toEqual({
      albumId,
      sectionId,
      code: 'FWC01',
      limit: 5,
      offset: 10
    });
  });

  it('rejects invalid sticker numbers', () => {
    expect(() =>
      parseCreateStickerInput(
        {
          sectionId,
          code: 'BRA01',
          number: 0
        },
        albumId,
        'access-token'
      )
    ).toThrow(UnprocessableEntityException);
  });
});
