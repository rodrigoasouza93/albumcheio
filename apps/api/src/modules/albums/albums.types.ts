export type AlbumSectionKind = 'tournament' | 'team' | 'custom';
export type AlbumStatus = 'draft' | 'published' | 'archived';

export interface PageQuery {
  readonly limit: number;
  readonly offset: number;
}

export interface CreateAlbumInput {
  readonly userId: string;
  readonly accessToken: string;
  readonly name: string;
  readonly edition: string | null;
  readonly description: string | null;
}

export interface CreateAlbumSectionInput {
  readonly accessToken: string;
  readonly albumId: string;
  readonly name: string;
  readonly code: string;
  readonly kind: AlbumSectionKind;
  readonly sortOrder: number;
}

export interface UpdateAlbumInput {
  readonly accessToken: string;
  readonly albumId: string;
  readonly name?: string;
  readonly edition?: string | null;
  readonly description?: string | null;
}

export interface UpdateAlbumStatusInput {
  readonly accessToken: string;
  readonly albumId: string;
  readonly status: AlbumStatus;
}

export interface UpdateAlbumSectionInput {
  readonly accessToken: string;
  readonly albumId: string;
  readonly sectionId: string;
  readonly name?: string;
  readonly code?: string;
  readonly kind?: AlbumSectionKind;
  readonly sortOrder?: number;
}

export interface AlbumSummary {
  readonly id: string;
  readonly name: string;
  readonly edition: string | null;
  readonly description: string | null;
  readonly status: AlbumStatus;
  readonly createdBy: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AlbumSectionSummary {
  readonly id: string;
  readonly albumId: string;
  readonly name: string;
  readonly code: string;
  readonly kind: AlbumSectionKind;
  readonly sortOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AlbumDetail extends AlbumSummary {
  readonly sections: readonly AlbumSectionSummary[];
}

export interface AlbumPage {
  readonly items: readonly AlbumSummary[];
  readonly limit: number;
  readonly offset: number;
}
