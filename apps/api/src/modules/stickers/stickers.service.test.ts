import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { SupabaseApiError } from '../supabase/supabase-api.error.js';
import type { StickersRepository } from './data/stickers.repository.js';
import { StickersService } from './stickers.service.js';

const stickerRow = {
  id: 'sticker-id',
  album_id: 'album-id',
  section_id: 'section-id',
  code: 'BRA01',
  number: 1,
  title: 'Brazil Badge',
  sort_order: 10,
  created_at: '2026-05-25T10:00:00.000Z',
  updated_at: '2026-05-25T10:00:00.000Z'
};

describe('StickersService', () => {
  it('creates a sticker and maps API fields', async () => {
    const repository = {
      createSticker: vi.fn().mockResolvedValue(stickerRow)
    } as unknown as StickersRepository;
    const service = new StickersService(repository);

    const sticker = await service.createSticker({
      accessToken: 'access-token',
      albumId: 'album-id',
      sectionId: 'section-id',
      code: 'BRA01',
      number: 1,
      title: 'Brazil Badge',
      sortOrder: 10
    });

    expect(sticker).toEqual({
      id: 'sticker-id',
      albumId: 'album-id',
      sectionId: 'section-id',
      code: 'BRA01',
      number: 1,
      title: 'Brazil Badge',
      sortOrder: 10,
      createdAt: '2026-05-25T10:00:00.000Z',
      updatedAt: '2026-05-25T10:00:00.000Z'
    });
  });

  it('returns paginated sticker filters', async () => {
    const repository = {
      listStickers: vi.fn().mockResolvedValue([stickerRow])
    } as unknown as StickersRepository;
    const service = new StickersService(repository);

    const page = await service.listStickers({
      accessToken: 'access-token',
      filter: {
        albumId: 'album-id',
        code: 'BRA01',
        limit: 5,
        offset: 10
      }
    });

    expect(page).toEqual({
      items: [
        {
          id: 'sticker-id',
          albumId: 'album-id',
          sectionId: 'section-id',
          code: 'BRA01',
          number: 1,
          title: 'Brazil Badge',
          sortOrder: 10,
          createdAt: '2026-05-25T10:00:00.000Z',
          updatedAt: '2026-05-25T10:00:00.000Z'
        }
      ],
      limit: 5,
      offset: 10
    });
  });

  it('maps duplicate sticker codes to conflict responses', async () => {
    const repository = {
      createSticker: vi
        .fn()
        .mockRejectedValue(
          new SupabaseApiError(400, 'duplicate key value', '23505')
        )
    } as unknown as StickersRepository;
    const service = new StickersService(repository);

    await expect(
      service.createSticker({
        accessToken: 'access-token',
        albumId: 'album-id',
        sectionId: 'section-id',
        code: 'BRA01',
        number: 1,
        title: null,
        sortOrder: 0
      })
    ).rejects.toThrow(ConflictException);
  });
});
