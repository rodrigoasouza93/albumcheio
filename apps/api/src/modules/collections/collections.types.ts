import type { StickerSummary } from '../stickers/stickers.types.js';

export type CollectionSearchStatus =
  | 'not_found'
  | 'missing'
  | 'owned'
  | 'duplicate';

export interface SetStickerQuantityInput {
  readonly accessToken: string;
  readonly userId: string;
  readonly stickerId: string;
  readonly quantityTotal: number;
}

export interface CollectionItemSummary {
  readonly id: string;
  readonly userId: string;
  readonly stickerId: string;
  readonly quantityTotal: number;
  readonly owned: boolean;
  readonly duplicateCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface StickerCollectionStatus {
  readonly albumId: string;
  readonly code: string;
  readonly status: CollectionSearchStatus;
  readonly sticker: StickerSummary | null;
  readonly quantityTotal: number;
  readonly owned: boolean;
  readonly duplicateCount: number;
}

export interface SearchCollectionInput {
  readonly accessToken: string;
  readonly userId: string;
  readonly albumId: string;
  readonly code: string;
}

export interface CollectionPageQuery {
  readonly albumId: string;
  readonly sectionId?: string;
  readonly limit: number;
  readonly offset: number;
}

export interface CollectionListInput {
  readonly accessToken: string;
  readonly userId: string;
  readonly query: CollectionPageQuery;
}

export interface CollectionStickerListInput {
  readonly accessToken: string;
  readonly userId: string;
  readonly query: CollectionPageQuery;
}

export interface CollectionProgressInput {
  readonly accessToken: string;
  readonly userId: string;
  readonly albumId: string;
}

export interface SectionProgress {
  readonly sectionId: string;
  readonly sectionCode: string;
  readonly sectionName: string;
  readonly total: number;
  readonly owned: number;
  readonly missing: number;
  readonly percentage: number;
}

export interface AlbumProgress {
  readonly albumId: string;
  readonly total: number;
  readonly owned: number;
  readonly missing: number;
  readonly percentage: number;
  readonly sections: readonly SectionProgress[];
}

export interface MissingStickerSummary extends StickerSummary {
  readonly quantityTotal: number;
  readonly owned: false;
}

export interface DuplicateStickerSummary extends StickerSummary {
  readonly quantityTotal: number;
  readonly duplicateCount: number;
}

export interface CollectionStickerSummary extends StickerSummary {
  readonly quantityTotal: number;
  readonly owned: boolean;
  readonly duplicateCount: number;
  readonly status: CollectionSearchStatus;
}

export interface MissingStickerPage {
  readonly items: readonly MissingStickerSummary[];
  readonly limit: number;
  readonly offset: number;
}

export interface DuplicateStickerPage {
  readonly items: readonly DuplicateStickerSummary[];
  readonly limit: number;
  readonly offset: number;
}

export interface CollectionStickerPage {
  readonly items: readonly CollectionStickerSummary[];
  readonly limit: number;
  readonly offset: number;
}
