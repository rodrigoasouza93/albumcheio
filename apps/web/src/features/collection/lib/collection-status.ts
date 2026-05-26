import type {
  AlbumProgress,
  AlbumSectionSummary,
  CollectionSearchStatus,
  DuplicateStickerSummary,
  MissingStickerSummary,
  StickerCollectionStatus,
  StickerSummary
} from '@web/lib/api/api-types';

export type StickerStatus = Exclude<CollectionSearchStatus, 'not_found'>;

export interface StickerCollectionView extends StickerSummary {
  readonly sectionName: string;
  readonly quantityTotal: number;
  readonly duplicateCount: number;
  readonly status: StickerStatus;
}

export interface CollectionSummaryLists {
  readonly missing: readonly MissingStickerSummary[];
  readonly duplicates: readonly DuplicateStickerSummary[];
}

export const getStickerStatus = (quantityTotal: number): StickerStatus => {
  if (quantityTotal === 0) {
    return 'missing';
  }

  return quantityTotal > 1 ? 'duplicate' : 'owned';
};

export const getStatusLabel = (status: CollectionSearchStatus): string => {
  const labels: Record<CollectionSearchStatus, string> = {
    duplicate: 'Repetida',
    missing: 'Faltando',
    not_found: 'Não está neste álbum',
    owned: 'Tenho'
  };

  return labels[status];
};

export const getDuplicateCount = (quantityTotal: number): number =>
  Math.max(quantityTotal - 1, 0);

const hasSticker = (
  status: StickerCollectionStatus
): status is StickerCollectionStatus & {
  readonly sticker: StickerSummary;
} => status.sticker !== null;

export const createQuantityMap = (
  statuses: readonly StickerCollectionStatus[]
): ReadonlyMap<string, number> =>
  new Map(
    statuses
      .filter(hasSticker)
      .map((status) => [status.sticker.id, status.quantityTotal] as const)
  );

export const createStickerViews = (input: {
  readonly sections: readonly AlbumSectionSummary[];
  readonly stickers: readonly StickerSummary[];
  readonly quantities: ReadonlyMap<string, number>;
}): readonly StickerCollectionView[] => {
  const sectionNames = new Map(
    input.sections.map((section) => [section.id, section.name] as const)
  );

  return input.stickers.map((sticker) => {
    const quantityTotal = input.quantities.get(sticker.id) ?? 0;

    return {
      ...sticker,
      sectionName: sectionNames.get(sticker.sectionId) ?? 'Seção não atribuída',
      quantityTotal,
      duplicateCount: getDuplicateCount(quantityTotal),
      status: getStickerStatus(quantityTotal)
    };
  });
};

export const getFallbackProgress = (
  albumId: string,
  sections: readonly AlbumSectionSummary[]
): AlbumProgress => ({
  albumId,
  total: 0,
  owned: 0,
  missing: 0,
  percentage: 0,
  sections: sections.map((section) => ({
    sectionId: section.id,
    sectionCode: section.code,
    sectionName: section.name,
    total: 0,
    owned: 0,
    missing: 0,
    percentage: 0
  }))
});
