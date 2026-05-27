import { Inject, Injectable } from '@nestjs/common';

import { mapSupabaseError } from '../auth/supabase-error.mapper.js';
import { MetricsService } from '../observability/metrics.service.js';
import { StructuredLoggerService } from '../observability/structured-logger.service.js';
import type { SupabaseStickerRow } from '../supabase/supabase.types.js';
import type { CatalogActor } from '../albums/albums.types.js';
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
    private readonly stickersRepository: StickersRepository,
    private readonly metricsService: MetricsService,
    private readonly logger: StructuredLoggerService
  ) {}

  public async createSticker(
    input: CreateStickerInput
  ): Promise<StickerSummary> {
    try {
      const sticker = await this.stickersRepository.createSticker(input);
      this.recordAdminMutation(input.actor, {
        resource: 'sticker',
        action: 'create',
        outcome: 'success',
        albumId: input.albumId
      });

      return this.mapSticker(sticker);
    } catch (error) {
      this.recordAdminMutation(input.actor, {
        resource: 'sticker',
        action: 'create',
        outcome: 'failure',
        albumId: input.albumId
      });
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
      this.recordAdminMutation(input.actor, {
        resource: 'sticker',
        action: 'update',
        outcome: 'success',
        albumId: input.albumId
      });

      return this.mapSticker(sticker);
    } catch (error) {
      this.recordAdminMutation(input.actor, {
        resource: 'sticker',
        action: 'update',
        outcome: 'failure',
        albumId: input.albumId
      });
      throw mapSupabaseError(error);
    }
  }

  public async deleteSticker(input: {
    readonly accessToken: string;
    readonly actor?: CatalogActor;
    readonly albumId: string;
    readonly stickerId: string;
  }): Promise<void> {
    try {
      await this.stickersRepository.deleteSticker(input);
      this.recordAdminMutation(input.actor, {
        resource: 'sticker',
        action: 'delete',
        outcome: 'success',
        albumId: input.albumId
      });
    } catch (error) {
      this.recordAdminMutation(input.actor, {
        resource: 'sticker',
        action: 'delete',
        outcome: 'failure',
        albumId: input.albumId
      });
      throw mapSupabaseError(error);
    }
  }

  private recordAdminMutation(
    actor: CatalogActor | undefined,
    input: {
      readonly resource: string;
      readonly action: string;
      readonly outcome: string;
      readonly albumId?: string;
    }
  ): void {
    this.metricsService.recordCatalogAdminMutation(input);

    if (!actor) {
      return;
    }

    this.logger.logCatalogAdminMutation({
      userId: actor.userId,
      role: actor.role,
      ...input
    });
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
