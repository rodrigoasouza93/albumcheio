import type { CatalogActor, PageQuery } from '../albums/albums.types.js';

export interface CreateStickerInput {
  readonly actor?: CatalogActor;
  readonly accessToken: string;
  readonly albumId: string;
  readonly sectionId: string;
  readonly code: string;
  readonly number: number | null;
  readonly title: string | null;
  readonly sortOrder: number;
}

export interface UpdateStickerInput {
  readonly actor?: CatalogActor;
  readonly accessToken: string;
  readonly albumId: string;
  readonly stickerId: string;
  readonly sectionId?: string;
  readonly code?: string;
  readonly number?: number | null;
  readonly title?: string | null;
  readonly sortOrder?: number;
}

export interface StickerFilter extends PageQuery {
  readonly albumId: string;
  readonly sectionId?: string;
  readonly code?: string;
}

export interface StickerSummary {
  readonly id: string;
  readonly albumId: string;
  readonly sectionId: string;
  readonly code: string;
  readonly number: number | null;
  readonly title: string | null;
  readonly sortOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface StickerPage {
  readonly items: readonly StickerSummary[];
  readonly limit: number;
  readonly offset: number;
}
