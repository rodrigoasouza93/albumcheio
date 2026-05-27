import { Inject, Injectable } from '@nestjs/common';

import { mapSupabaseError } from '../auth/supabase-error.mapper.js';
import type { SupabaseStickerRow } from '../supabase/supabase.types.js';
import { StickersRepository } from './data/stickers.repository.js';
import type {
  CreateStickerInput,
  StickerFilter,
  StickerPage,
  StickerSummary,
  UpdateStickerInput
} from './stickers.types.js';

@Injectable()
export class StickersService {
  public constructor(
    @Inject(StickersRepository)
    private readonly stickersRepository: StickersRepository
  ) {}

  public async createSticker(
    input: CreateStickerInput
  ): Promise<StickerSummary> {
    try {
      const sticker = await this.stickersRepository.createSticker(input);

      return this.mapSticker(sticker);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  }

  public async listStickers(input: {
    readonly accessToken: string;
    readonly filter: StickerFilter;
  }): Promise<StickerPage> {
    try {
      const stickers = await this.stickersRepository.listStickers(
        input.accessToken,
        input.filter
      );

      return {
        items: stickers.map((sticker) => this.mapSticker(sticker)),
        limit: input.filter.limit,
        offset: input.filter.offset
      };
    } catch (error) {
      throw mapSupabaseError(error);
    }
  }

  public async updateSticker(
    input: UpdateStickerInput
  ): Promise<StickerSummary> {
    try {
      const sticker = await this.stickersRepository.updateSticker(input);

      return this.mapSticker(sticker);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  }

  public async deleteSticker(input: {
    readonly accessToken: string;
    readonly albumId: string;
    readonly stickerId: string;
  }): Promise<void> {
    try {
      await this.stickersRepository.deleteSticker(input);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  }

  private mapSticker(sticker: SupabaseStickerRow): StickerSummary {
    return {
      id: sticker.id,
      albumId: sticker.album_id,
      sectionId: sticker.section_id,
      code: sticker.code,
      number: sticker.number,
      title: sticker.title,
      sortOrder: sticker.sort_order,
      createdAt: sticker.created_at,
      updatedAt: sticker.updated_at
    };
  }
}
