export interface UserProfile {
  readonly id: string;
  readonly name: string;
  readonly email?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AuthSession {
  readonly user: UserProfile;
  readonly session: {
    readonly accessToken: string;
    readonly refreshToken: string;
    readonly expiresIn: number;
    readonly tokenType: string;
  };
}

export interface AlbumSummary {
  readonly id: string;
  readonly name: string;
  readonly edition: string | null;
  readonly description: string | null;
  readonly status: string;
  readonly createdBy: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AlbumSectionSummary {
  readonly id: string;
  readonly albumId: string;
  readonly name: string;
  readonly code: string;
  readonly kind: 'tournament' | 'team' | 'custom';
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

export interface CreateAlbumInput {
  readonly name: string;
  readonly edition: string | null;
  readonly description: string | null;
}

export interface CreateAlbumSectionInput {
  readonly name: string;
  readonly code: string;
  readonly kind: AlbumSectionSummary['kind'];
  readonly sortOrder: number;
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

export interface CreateStickerInput {
  readonly sectionId: string;
  readonly code: string;
  readonly number: number | null;
  readonly title: string | null;
  readonly sortOrder: number;
}

export type CollectionSearchStatus =
  | 'not_found'
  | 'missing'
  | 'owned'
  | 'duplicate';

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
