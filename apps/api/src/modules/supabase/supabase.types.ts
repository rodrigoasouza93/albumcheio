export interface SupabaseUser {
  readonly id: string;
  readonly email?: string;
}

export interface SupabaseAuthSession {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly expires_in: number;
  readonly token_type: string;
}

export interface SupabaseAuthPayload {
  readonly user: SupabaseUser | null;
  readonly session?: SupabaseAuthSession | null;
  readonly access_token?: string;
  readonly refresh_token?: string;
  readonly expires_in?: number;
  readonly token_type?: string;
}

export interface SupabaseProfileRow {
  readonly id: string;
  readonly name: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface SupabaseAlbumRow {
  readonly id: string;
  readonly name: string;
  readonly edition: string | null;
  readonly description: string | null;
  readonly created_by: string | null;
  readonly status: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface SupabaseAlbumSectionRow {
  readonly id: string;
  readonly album_id: string;
  readonly name: string;
  readonly code: string;
  readonly kind: string;
  readonly sort_order: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface SupabaseStickerRow {
  readonly id: string;
  readonly album_id: string;
  readonly section_id: string;
  readonly code: string;
  readonly number: number | null;
  readonly title: string | null;
  readonly sort_order: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface SupabaseCollectionItemRow {
  readonly id: string;
  readonly user_id: string;
  readonly sticker_id: string;
  readonly quantity_total: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface SupabaseAuthUserPayload {
  readonly user: SupabaseUser;
}
