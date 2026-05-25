import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { SupabaseApiError } from '../supabase/supabase-api.error.js';
import type { CollectionsRepository } from './data/collections.repository.js';
import { CollectionsService } from './collections.service.js';

const timestamp = '2026-05-25T10:00:00.000Z';
const albumId = 'album-id';
const sectionId = 'section-id';
const userId = 'user-id';
const accessToken = 'access-token';

const stickerRow = {
  id: 'sticker-id',
  album_id: albumId,
  section_id: sectionId,
  code: 'BRA01',
  number: 1,
  title: 'Brazil Badge',
  sort_order: 10,
  created_at: timestamp,
  updated_at: timestamp
};
const secondStickerRow = {
  ...stickerRow,
  id: 'second-sticker-id',
  code: 'BRA02',
  number: 2,
  sort_order: 20
};
const sectionRow = {
  id: sectionId,
  album_id: albumId,
  name: 'Brazil',
  code: 'BRA',
  kind: 'team',
  sort_order: 10,
  created_at: timestamp,
  updated_at: timestamp
};
const itemRow = {
  id: 'collection-item-id',
  user_id: userId,
  sticker_id: 'sticker-id',
  quantity_total: 3,
  created_at: timestamp,
  updated_at: timestamp
};

describe('CollectionsService', () => {
  it('sets quantity and derives owned and duplicate state', async () => {
    const repository = {
      getSticker: vi.fn().mockResolvedValue(stickerRow),
      setStickerQuantity: vi.fn().mockResolvedValue(itemRow)
    } as unknown as CollectionsRepository;
    const service = new CollectionsService(repository);

    const item = await service.setStickerQuantity({
      accessToken,
      userId,
      stickerId: 'sticker-id',
      quantityTotal: 3
    });

    expect(item).toEqual({
      id: 'collection-item-id',
      userId,
      stickerId: 'sticker-id',
      quantityTotal: 3,
      owned: true,
      duplicateCount: 2,
      createdAt: timestamp,
      updatedAt: timestamp
    });
  });

  it('differentiates missing, duplicate, and nonexistent code search', async () => {
    const repository = {
      findStickerByCode: vi
        .fn()
        .mockResolvedValueOnce(stickerRow)
        .mockResolvedValueOnce(stickerRow)
        .mockResolvedValueOnce(null),
      getCollectionItem: vi
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(itemRow)
    } as unknown as CollectionsRepository;
    const service = new CollectionsService(repository);

    const missing = await service.searchSticker({
      accessToken,
      userId,
      albumId,
      code: 'BRA01'
    });
    const duplicate = await service.searchSticker({
      accessToken,
      userId,
      albumId,
      code: 'BRA01'
    });
    const notFound = await service.searchSticker({
      accessToken,
      userId,
      albumId,
      code: 'ARG01'
    });

    expect(missing.status).toBe('missing');
    expect(duplicate).toMatchObject({
      status: 'duplicate',
      quantityTotal: 3,
      duplicateCount: 2
    });
    expect(notFound).toMatchObject({
      status: 'not_found',
      sticker: null
    });
  });

  it('calculates overall and section progress from quantities', async () => {
    const repository = {
      listAlbumStickers: vi
        .fn()
        .mockResolvedValue([stickerRow, secondStickerRow]),
      listAlbumCollectionItems: vi.fn().mockResolvedValue([itemRow]),
      listAlbumSections: vi.fn().mockResolvedValue([sectionRow])
    } as unknown as CollectionsRepository;
    const service = new CollectionsService(repository);

    const progress = await service.getAlbumProgress({
      accessToken,
      userId,
      albumId
    });

    expect(progress).toEqual({
      albumId,
      total: 2,
      owned: 1,
      missing: 1,
      percentage: 50,
      sections: [
        {
          sectionId,
          sectionCode: 'BRA',
          sectionName: 'Brazil',
          total: 2,
          owned: 1,
          missing: 1,
          percentage: 50
        }
      ]
    });
  });

  it('lists paginated missing and duplicate stickers', async () => {
    const repository = {
      listAlbumStickers: vi
        .fn()
        .mockResolvedValue([stickerRow, secondStickerRow]),
      listAlbumCollectionItems: vi.fn().mockResolvedValue([itemRow])
    } as unknown as CollectionsRepository;
    const service = new CollectionsService(repository);

    const missing = await service.listMissing({
      accessToken,
      userId,
      query: {
        albumId,
        limit: 10,
        offset: 0
      }
    });
    const duplicates = await service.listDuplicates({
      accessToken,
      userId,
      query: {
        albumId,
        limit: 10,
        offset: 0
      }
    });

    expect(missing.items).toHaveLength(1);
    expect(missing.items[0]).toMatchObject({
      id: 'second-sticker-id',
      quantityTotal: 0,
      owned: false
    });
    expect(duplicates.items).toHaveLength(1);
    expect(duplicates.items[0]).toMatchObject({
      id: 'sticker-id',
      quantityTotal: 3,
      duplicateCount: 2
    });
  });

  it('maps nonexistent stickers to not found errors before upsert', async () => {
    const setStickerQuantity = vi.fn();
    const repository = {
      getSticker: vi
        .fn()
        .mockRejectedValue(new SupabaseApiError(404, 'Sticker not found')),
      setStickerQuantity
    } as unknown as CollectionsRepository;
    const service = new CollectionsService(repository);

    await expect(
      service.setStickerQuantity({
        accessToken,
        userId,
        stickerId: 'missing-sticker-id',
        quantityTotal: 1
      })
    ).rejects.toThrow(NotFoundException);
    expect(setStickerQuantity).not.toHaveBeenCalled();
  });
});
