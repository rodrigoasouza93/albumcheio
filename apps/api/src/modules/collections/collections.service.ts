import { Inject, Injectable } from '@nestjs/common';

import { mapSupabaseError } from '../auth/supabase-error.mapper.js';
import { MetricsService } from '../observability/metrics.service.js';
import { StructuredLoggerService } from '../observability/structured-logger.service.js';
import type {
  SupabaseAlbumSectionRow,
  SupabaseCollectionItemRow,
  SupabaseStickerRow
} from '../supabase/supabase.types.js';
import { CollectionsRepository } from './data/collections.repository.js';
import type {
  AlbumProgress,
  CollectionItemSummary,
  CollectionListInput,
  CollectionProgressInput,
  CollectionSearchStatus,
  CollectionStickerListInput,
  CollectionStickerPage,
  CollectionStickerSummary,
  DuplicateStickerPage,
  DuplicateStickerSummary,
  MissingStickerPage,
  SearchCollectionInput,
  SectionProgress,
  SetStickerQuantityInput,
  StickerCollectionStatus
} from './collections.types.js';

@Injectable()
export class CollectionsService {
  public constructor(
    @Inject(CollectionsRepository)
    private readonly collectionsRepository: CollectionsRepository,
    @Inject(MetricsService)
    private readonly metricsService: MetricsService,
    @Inject(StructuredLoggerService)
    private readonly logger: StructuredLoggerService
  ) {}

  public async setStickerQuantity(
    input: SetStickerQuantityInput
  ): Promise<CollectionItemSummary> {
    try {
      await this.collectionsRepository.getSticker(
        input.accessToken,
        input.stickerId
      );
      const item = await this.collectionsRepository.setStickerQuantity(input);

      this.metricsService.recordCollectionUpdate('success');

      return this.mapCollectionItem(item);
    } catch (error) {
      this.metricsService.recordCollectionUpdate('failure');
      throw mapSupabaseError(error);
    }
  }

  public async searchSticker(
    input: SearchCollectionInput
  ): Promise<StickerCollectionStatus> {
    try {
      const sticker = await this.collectionsRepository.findStickerByCode(input);

      if (!sticker) {
        this.metricsService.recordStickerSearch('not_found');

        return {
          albumId: input.albumId,
          code: input.code,
          status: 'not_found',
          sticker: null,
          quantityTotal: 0,
          owned: false,
          duplicateCount: 0
        };
      }

      const item = await this.collectionsRepository.getCollectionItem({
        accessToken: input.accessToken,
        userId: input.userId,
        stickerId: sticker.id
      });
      const quantityTotal = item?.quantity_total ?? 0;
      const duplicateCount = this.calculateDuplicateCount(quantityTotal);
      const status = this.getSearchStatus(quantityTotal);

      this.metricsService.recordStickerSearch(status);

      return {
        albumId: input.albumId,
        code: input.code,
        status,
        sticker: this.mapSticker(sticker),
        quantityTotal,
        owned: quantityTotal > 0,
        duplicateCount
      };
    } catch (error) {
      throw mapSupabaseError(error);
    }
  }

  public async getAlbumProgress(
    input: CollectionProgressInput
  ): Promise<AlbumProgress> {
    const startedAt = performance.now();

    try {
      const [stickers, items, sections] = await Promise.all([
        this.collectionsRepository.listAlbumStickers(input.accessToken, {
          albumId: input.albumId
        }),
        this.collectionsRepository.listAlbumCollectionItems(input),
        this.collectionsRepository.listAlbumSections(
          input.accessToken,
          input.albumId
        )
      ]);
      const quantities = this.createQuantityMap(items);
      const sectionProgress = sections.map((section) =>
        this.calculateSectionProgress(section, stickers, quantities)
      );
      const owned = stickers.filter(
        (sticker) => (quantities.get(sticker.id) ?? 0) > 0
      ).length;
      const total = stickers.length;

      const progress = {
        albumId: input.albumId,
        total,
        owned,
        missing: total - owned,
        percentage: this.calculatePercentage(owned, total),
        sections: sectionProgress
      };

      this.metricsService.observeProgressCalculation({
        outcome: 'success',
        durationSeconds: (performance.now() - startedAt) / 1000
      });

      return progress;
    } catch (error) {
      this.metricsService.observeProgressCalculation({
        outcome: 'failure',
        durationSeconds: (performance.now() - startedAt) / 1000
      });
      throw mapSupabaseError(error);
    }
  }

  public async listCollectionStickers(
    input: CollectionStickerListInput
  ): Promise<CollectionStickerPage> {
    const startedAt = performance.now();
    const scope = this.getListScope(input.query.sectionId);

    try {
      await this.assertSectionBelongsToAlbum(input);

      const stickers = await this.collectionsRepository.listCollectionStickers(
        input.accessToken,
        input.query
      );
      const items =
        await this.collectionsRepository.listCollectionItemsByStickerIds({
          accessToken: input.accessToken,
          userId: input.userId,
          stickerIds: stickers.map((sticker) => sticker.id)
        });
      const quantities = this.createQuantityMap(items);
      const page = {
        items: stickers.map((sticker) =>
          this.mapCollectionSticker(sticker, quantities.get(sticker.id) ?? 0)
        ),
        limit: input.query.limit,
        offset: input.query.offset
      };
      const durationSeconds = (performance.now() - startedAt) / 1000;

      this.metricsService.observeCollectionStickerList({
        scope,
        outcome: 'success',
        durationSeconds
      });
      this.logger.logCollectionStickerList({
        userId: input.userId,
        albumId: input.query.albumId,
        sectionId: input.query.sectionId,
        limit: input.query.limit,
        offset: input.query.offset,
        itemsCount: page.items.length,
        durationMs: durationSeconds * 1000
      });

      return page;
    } catch (error) {
      this.metricsService.observeCollectionStickerList({
        scope,
        outcome: 'failure',
        durationSeconds: (performance.now() - startedAt) / 1000
      });
      throw mapSupabaseError(error);
    }
  }

  public async listMissing(
    input: CollectionListInput
  ): Promise<MissingStickerPage> {
    try {
      const [stickers, items] = await Promise.all([
        this.collectionsRepository.listAlbumStickers(
          input.accessToken,
          input.query
        ),
        this.collectionsRepository.listAlbumCollectionItems({
          accessToken: input.accessToken,
          userId: input.userId,
          albumId: input.query.albumId
        })
      ]);
      const quantities = this.createQuantityMap(items);
      const missing = stickers
        .filter((sticker) => (quantities.get(sticker.id) ?? 0) === 0)
        .map((sticker) => ({
          ...this.mapSticker(sticker),
          quantityTotal: 0,
          owned: false as const
        }));

      return {
        items: this.paginate(missing, input.query.limit, input.query.offset),
        limit: input.query.limit,
        offset: input.query.offset
      };
    } catch (error) {
      throw mapSupabaseError(error);
    }
  }

  public async listDuplicates(
    input: CollectionListInput
  ): Promise<DuplicateStickerPage> {
    try {
      const [stickers, items] = await Promise.all([
        this.collectionsRepository.listAlbumStickers(
          input.accessToken,
          input.query
        ),
        this.collectionsRepository.listAlbumCollectionItems({
          accessToken: input.accessToken,
          userId: input.userId,
          albumId: input.query.albumId
        })
      ]);
      const quantities = this.createQuantityMap(items);
      const duplicates = stickers
        .map((sticker) =>
          this.mapDuplicateSticker(sticker, quantities.get(sticker.id) ?? 0)
        )
        .filter(
          (sticker): sticker is DuplicateStickerSummary => sticker !== null
        );

      return {
        items: this.paginate(duplicates, input.query.limit, input.query.offset),
        limit: input.query.limit,
        offset: input.query.offset
      };
    } catch (error) {
      throw mapSupabaseError(error);
    }
  }

  private calculateSectionProgress(
    section: SupabaseAlbumSectionRow,
    stickers: readonly SupabaseStickerRow[],
    quantities: ReadonlyMap<string, number>
  ): SectionProgress {
    const sectionStickers = stickers.filter(
      (sticker) => sticker.section_id === section.id
    );
    const owned = sectionStickers.filter(
      (sticker) => (quantities.get(sticker.id) ?? 0) > 0
    ).length;
    const total = sectionStickers.length;

    return {
      sectionId: section.id,
      sectionCode: section.code,
      sectionName: section.name,
      total,
      owned,
      missing: total - owned,
      percentage: this.calculatePercentage(owned, total)
    };
  }

  private mapDuplicateSticker(
    sticker: SupabaseStickerRow,
    quantityTotal: number
  ): DuplicateStickerSummary | null {
    const duplicateCount = this.calculateDuplicateCount(quantityTotal);

    if (duplicateCount === 0) {
      return null;
    }

    return {
      ...this.mapSticker(sticker),
      quantityTotal,
      duplicateCount
    };
  }

  private mapCollectionSticker(
    sticker: SupabaseStickerRow,
    quantityTotal: number
  ): CollectionStickerSummary {
    return {
      ...this.mapSticker(sticker),
      quantityTotal,
      owned: quantityTotal > 0,
      duplicateCount: this.calculateDuplicateCount(quantityTotal),
      status: this.getSearchStatus(quantityTotal)
    };
  }

  private async assertSectionBelongsToAlbum(
    input: CollectionStickerListInput
  ): Promise<void> {
    if (!input.query.sectionId) {
      return;
    }

    await this.collectionsRepository.getAlbumSection({
      accessToken: input.accessToken,
      albumId: input.query.albumId,
      sectionId: input.query.sectionId
    });
  }

  private getListScope(sectionId: string | undefined): 'section' | 'all' {
    return sectionId ? 'section' : 'all';
  }

  private createQuantityMap(
    items: readonly SupabaseCollectionItemRow[]
  ): ReadonlyMap<string, number> {
    return new Map(
      items.map((item) => [item.sticker_id, item.quantity_total] as const)
    );
  }

  private getSearchStatus(quantityTotal: number): CollectionSearchStatus {
    if (quantityTotal === 0) {
      return 'missing';
    }

    return quantityTotal > 1 ? 'duplicate' : 'owned';
  }

  private mapCollectionItem(
    item: SupabaseCollectionItemRow
  ): CollectionItemSummary {
    return {
      id: item.id,
      userId: item.user_id,
      stickerId: item.sticker_id,
      quantityTotal: item.quantity_total,
      owned: item.quantity_total > 0,
      duplicateCount: this.calculateDuplicateCount(item.quantity_total),
      createdAt: item.created_at,
      updatedAt: item.updated_at
    };
  }

  private mapSticker(sticker: SupabaseStickerRow) {
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

  private calculateDuplicateCount(quantityTotal: number): number {
    return Math.max(quantityTotal - 1, 0);
  }

  private calculatePercentage(owned: number, total: number): number {
    return total === 0 ? 0 : Math.round((owned / total) * 10000) / 100;
  }

  private paginate<Item>(
    items: readonly Item[],
    limit: number,
    offset: number
  ): readonly Item[] {
    return items.slice(offset, offset + limit);
  }
}
