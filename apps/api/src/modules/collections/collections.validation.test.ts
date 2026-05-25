import { UnprocessableEntityException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import {
  parseCollectionPageQuery,
  parseSearchCollectionInput,
  parseSetStickerQuantityInput
} from './collections.validation.js';

const albumId = '00000000-0000-4000-8000-000000000001';
const sectionId = '00000000-0000-4000-8000-000000000101';
const stickerId = '00000000-0000-4000-8000-000000001001';
const authenticated = {
  userId: '00000000-0000-4000-8000-000000000999',
  accessToken: 'access-token'
};

describe('collection validation', () => {
  it('accepts zero quantity to remove ownership', () => {
    expect(
      parseSetStickerQuantityInput(
        {
          quantityTotal: 0
        },
        stickerId,
        authenticated
      )
    ).toEqual({
      ...authenticated,
      stickerId,
      quantityTotal: 0
    });
  });

  it('rejects negative quantity', () => {
    expect(() =>
      parseSetStickerQuantityInput(
        {
          quantityTotal: -1
        },
        stickerId,
        authenticated
      )
    ).toThrow(UnprocessableEntityException);
  });

  it('normalizes searched sticker codes', () => {
    expect(
      parseSearchCollectionInput(
        {
          code: ' bra01 '
        },
        albumId,
        authenticated
      )
    ).toEqual({
      ...authenticated,
      albumId,
      code: 'BRA01'
    });
  });

  it('keeps pagination and optional section filter', () => {
    expect(
      parseCollectionPageQuery(
        {
          sectionId,
          limit: '5',
          offset: '10'
        },
        albumId
      )
    ).toEqual({
      albumId,
      sectionId,
      limit: 5,
      offset: 10
    });
  });
});
