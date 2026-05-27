import { SupabaseApiError } from './supabase-api.error.js';
import type {
  SupabaseAlbumRow,
  SupabaseAlbumSectionRow,
  SupabaseAuthPayload,
  SupabaseAuthUserPayload,
  SupabaseCollectionItemRow,
  SupabaseProfileRow,
  SupabaseStickerRow
} from './supabase.types.js';

type HttpMethod = 'GET' | 'POST';

interface SupabaseRequestOptions {
  readonly method: HttpMethod;
  readonly path: string;
  readonly body?: unknown;
  readonly accept?: string;
  readonly prefer?: string;
}

interface SupabaseClientOptions {
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly authorizationToken: string;
}

const JSON_CONTENT_TYPE = 'application/json';
const ALBUM_SELECT =
  'id,name,edition,description,created_by,status,created_at,updated_at';
const SECTION_SELECT =
  'id,album_id,name,code,kind,sort_order,created_at,updated_at';
const STICKER_SELECT =
  'id,album_id,section_id,code,number,title,sort_order,created_at,updated_at';
const COLLECTION_ITEM_SELECT =
  'id,user_id,sticker_id,quantity_total,created_at,updated_at';
const MAX_COLLECTION_STICKERS = 10000;

export class SupabaseClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly authorizationToken: string;

  public constructor(options: SupabaseClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.apiKey = options.apiKey;
    this.authorizationToken = options.authorizationToken;
  }

  public async signUp(input: {
    readonly email: string;
    readonly password: string;
    readonly name: string;
  }): Promise<SupabaseAuthPayload> {
    return this.request<SupabaseAuthPayload>({
      method: 'POST',
      path: '/auth/v1/signup',
      body: {
        email: input.email,
        password: input.password,
        data: {
          name: input.name
        }
      }
    });
  }

  public async signInWithPassword(input: {
    readonly email: string;
    readonly password: string;
  }): Promise<SupabaseAuthPayload> {
    return this.request<SupabaseAuthPayload>({
      method: 'POST',
      path: '/auth/v1/token?grant_type=password',
      body: {
        email: input.email,
        password: input.password
      }
    });
  }

  public async signOut(): Promise<void> {
    await this.request<void>({
      method: 'POST',
      path: '/auth/v1/logout'
    });
  }

  public async getAuthenticatedUser(): Promise<SupabaseAuthUserPayload> {
    const payload = await this.request<unknown>({
      method: 'GET',
      path: '/auth/v1/user'
    });

    return this.normalizeAuthenticatedUser(payload);
  }

  public async insertProfile(input: {
    readonly id: string;
    readonly name: string;
  }): Promise<SupabaseProfileRow> {
    const profiles = await this.request<readonly SupabaseProfileRow[]>({
      method: 'POST',
      path: '/rest/v1/profiles',
      body: {
        id: input.id,
        name: input.name
      },
      prefer: 'return=representation'
    });

    return this.requireSingleProfile(profiles);
  }

  public async getProfile(userId: string): Promise<SupabaseProfileRow> {
    const query = new URLSearchParams({
      id: `eq.${userId}`,
      select: 'id,name,role,created_at,updated_at'
    });
    const profiles = await this.request<readonly SupabaseProfileRow[]>({
      method: 'GET',
      path: `/rest/v1/profiles?${query.toString()}`
    });

    return this.requireSingleProfile(profiles);
  }

  public async insertAlbum(input: {
    readonly name: string;
    readonly edition: string | null;
    readonly description: string | null;
    readonly createdBy: string;
  }): Promise<SupabaseAlbumRow> {
    const albums = await this.request<readonly SupabaseAlbumRow[]>({
      method: 'POST',
      path: '/rest/v1/albums',
      body: {
        name: input.name,
        edition: input.edition,
        description: input.description,
        created_by: input.createdBy
      },
      prefer: 'return=representation'
    });

    return this.requireSingleRow(albums, 'Album not found');
  }

  public async listAlbums(input: {
    readonly limit: number;
    readonly offset: number;
  }): Promise<readonly SupabaseAlbumRow[]> {
    const query = new URLSearchParams({
      select: ALBUM_SELECT,
      order: 'created_at.desc,id.asc',
      limit: String(input.limit),
      offset: String(input.offset)
    });

    return this.request<readonly SupabaseAlbumRow[]>({
      method: 'GET',
      path: `/rest/v1/albums?${query.toString()}`
    });
  }

  public async getAlbum(albumId: string): Promise<SupabaseAlbumRow> {
    const query = new URLSearchParams({
      id: `eq.${albumId}`,
      select: ALBUM_SELECT
    });
    const albums = await this.request<readonly SupabaseAlbumRow[]>({
      method: 'GET',
      path: `/rest/v1/albums?${query.toString()}`
    });

    return this.requireSingleRow(albums, 'Album not found');
  }

  public async insertAlbumSection(input: {
    readonly albumId: string;
    readonly name: string;
    readonly code: string;
    readonly kind: string;
    readonly sortOrder: number;
  }): Promise<SupabaseAlbumSectionRow> {
    const sections = await this.request<readonly SupabaseAlbumSectionRow[]>({
      method: 'POST',
      path: '/rest/v1/album_sections',
      body: {
        album_id: input.albumId,
        name: input.name,
        code: input.code,
        kind: input.kind,
        sort_order: input.sortOrder
      },
      prefer: 'return=representation'
    });

    return this.requireSingleRow(sections, 'Album section not found');
  }

  public async listAlbumSections(
    albumId: string
  ): Promise<readonly SupabaseAlbumSectionRow[]> {
    const query = new URLSearchParams({
      album_id: `eq.${albumId}`,
      select: SECTION_SELECT,
      order: 'sort_order.asc,id.asc'
    });

    return this.request<readonly SupabaseAlbumSectionRow[]>({
      method: 'GET',
      path: `/rest/v1/album_sections?${query.toString()}`
    });
  }

  public async insertSticker(input: {
    readonly albumId: string;
    readonly sectionId: string;
    readonly code: string;
    readonly number: number | null;
    readonly title: string | null;
    readonly sortOrder: number;
  }): Promise<SupabaseStickerRow> {
    const stickers = await this.request<readonly SupabaseStickerRow[]>({
      method: 'POST',
      path: '/rest/v1/stickers',
      body: {
        album_id: input.albumId,
        section_id: input.sectionId,
        code: input.code,
        number: input.number,
        title: input.title,
        sort_order: input.sortOrder
      },
      prefer: 'return=representation'
    });

    return this.requireSingleRow(stickers, 'Sticker not found');
  }

  public async listStickers(input: {
    readonly albumId: string;
    readonly sectionId?: string;
    readonly code?: string;
    readonly limit: number;
    readonly offset: number;
  }): Promise<readonly SupabaseStickerRow[]> {
    const query = new URLSearchParams({
      album_id: `eq.${input.albumId}`,
      select: STICKER_SELECT,
      order: 'sort_order.asc,id.asc',
      limit: String(input.limit),
      offset: String(input.offset)
    });

    if (input.sectionId) {
      query.set('section_id', `eq.${input.sectionId}`);
    }

    if (input.code) {
      query.set('code', `eq.${input.code}`);
    }

    return this.request<readonly SupabaseStickerRow[]>({
      method: 'GET',
      path: `/rest/v1/stickers?${query.toString()}`
    });
  }

  public async getSticker(stickerId: string): Promise<SupabaseStickerRow> {
    const query = new URLSearchParams({
      id: `eq.${stickerId}`,
      select: STICKER_SELECT
    });
    const stickers = await this.request<readonly SupabaseStickerRow[]>({
      method: 'GET',
      path: `/rest/v1/stickers?${query.toString()}`
    });

    return this.requireSingleRow(stickers, 'Sticker not found');
  }

  public async findStickerByCode(input: {
    readonly albumId: string;
    readonly code: string;
  }): Promise<SupabaseStickerRow | null> {
    const stickers = await this.listStickers({
      albumId: input.albumId,
      code: input.code,
      limit: 1,
      offset: 0
    });

    return stickers.at(0) ?? null;
  }

  public async upsertCollectionItem(input: {
    readonly userId: string;
    readonly stickerId: string;
    readonly quantityTotal: number;
  }): Promise<SupabaseCollectionItemRow> {
    const query = new URLSearchParams({
      on_conflict: 'user_id,sticker_id'
    });
    const items = await this.request<readonly SupabaseCollectionItemRow[]>({
      method: 'POST',
      path: `/rest/v1/collection_items?${query.toString()}`,
      body: {
        user_id: input.userId,
        sticker_id: input.stickerId,
        quantity_total: input.quantityTotal
      },
      prefer: 'resolution=merge-duplicates,return=representation'
    });

    return this.requireSingleRow(items, 'Collection item not found');
  }

  public async getCollectionItem(input: {
    readonly userId: string;
    readonly stickerId: string;
  }): Promise<SupabaseCollectionItemRow | null> {
    const query = new URLSearchParams({
      user_id: `eq.${input.userId}`,
      sticker_id: `eq.${input.stickerId}`,
      select: COLLECTION_ITEM_SELECT
    });
    const items = await this.request<readonly SupabaseCollectionItemRow[]>({
      method: 'GET',
      path: `/rest/v1/collection_items?${query.toString()}`
    });

    return items.at(0) ?? null;
  }

  public async listAlbumStickersForCollection(input: {
    readonly albumId: string;
    readonly sectionId?: string;
  }): Promise<readonly SupabaseStickerRow[]> {
    const query = new URLSearchParams({
      album_id: `eq.${input.albumId}`,
      select: STICKER_SELECT,
      order: 'sort_order.asc,id.asc',
      limit: String(MAX_COLLECTION_STICKERS),
      offset: '0'
    });

    if (input.sectionId) {
      query.set('section_id', `eq.${input.sectionId}`);
    }

    return this.request<readonly SupabaseStickerRow[]>({
      method: 'GET',
      path: `/rest/v1/stickers?${query.toString()}`
    });
  }

  public async listAlbumCollectionItems(input: {
    readonly userId: string;
    readonly albumId: string;
  }): Promise<readonly SupabaseCollectionItemRow[]> {
    const query = new URLSearchParams({
      user_id: `eq.${input.userId}`,
      select: `${COLLECTION_ITEM_SELECT},stickers!inner(album_id)`,
      'stickers.album_id': `eq.${input.albumId}`,
      order: 'sticker_id.asc'
    });

    return this.request<readonly SupabaseCollectionItemRow[]>({
      method: 'GET',
      path: `/rest/v1/collection_items?${query.toString()}`
    });
  }

  private requireSingleProfile(
    profiles: readonly SupabaseProfileRow[]
  ): SupabaseProfileRow {
    const profile = profiles.at(0);

    if (!profile) {
      throw new SupabaseApiError(404, 'Profile not found');
    }

    return profile;
  }

  private requireSingleRow<Row>(
    rows: readonly Row[],
    notFoundMessage: string
  ): Row {
    const row = rows.at(0);

    if (!row) {
      throw new SupabaseApiError(404, notFoundMessage);
    }

    return row;
  }

  private normalizeAuthenticatedUser(payload: unknown): SupabaseAuthUserPayload {
    if (
      payload &&
      typeof payload === 'object' &&
      'user' in payload &&
      this.isSupabaseUser(payload.user)
    ) {
      return {
        user: payload.user
      };
    }

    if (this.isSupabaseUser(payload)) {
      return {
        user: payload
      };
    }

    throw new SupabaseApiError(502, 'Supabase did not return a user');
  }

  private isSupabaseUser(
    value: unknown
  ): value is SupabaseAuthUserPayload['user'] {
    return (
      Boolean(value) &&
      typeof value === 'object' &&
      typeof (value as Record<string, unknown>).id === 'string'
    );
  }

  private async request<T>(options: SupabaseRequestOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${options.path}`, {
      method: options.method,
      headers: this.createHeaders(options),
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body)
    });

    if (!response.ok) {
      throw await this.createError(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  private createHeaders(
    options: SupabaseRequestOptions
  ): Record<string, string> {
    return {
      apikey: this.apiKey,
      Authorization: `Bearer ${this.authorizationToken}`,
      Accept: options.accept ?? JSON_CONTENT_TYPE,
      'Content-Type': JSON_CONTENT_TYPE,
      ...(options.prefer ? { Prefer: options.prefer } : {})
    };
  }

  private async createError(response: Response): Promise<SupabaseApiError> {
    const payload = await this.readErrorPayload(response);
    const message = this.getErrorMessage(payload) ?? response.statusText;
    const code = this.getErrorCode(payload);

    return new SupabaseApiError(response.status, message, code);
  }

  private async readErrorPayload(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes(JSON_CONTENT_TYPE)) {
      return response.json();
    }

    return response.text();
  }

  private getErrorMessage(payload: unknown): string | undefined {
    if (typeof payload === 'string') {
      return payload;
    }

    if (!payload || typeof payload !== 'object') {
      return undefined;
    }

    const record = payload as Record<string, unknown>;
    const message = record.message ?? record.error_description ?? record.msg;

    return typeof message === 'string' ? message : undefined;
  }

  private getErrorCode(payload: unknown): string | undefined {
    if (!payload || typeof payload !== 'object') {
      return undefined;
    }

    const code = (payload as Record<string, unknown>).code;

    return typeof code === 'string' ? code : undefined;
  }
}
