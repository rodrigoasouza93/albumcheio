import { Inject, Injectable } from '@nestjs/common';

import { SupabaseService } from '../../supabase/supabase.service.js';
import type {
  SupabaseAlbumSectionRow,
  SupabaseCollectionItemRow,
  SupabaseStickerRow
} from '../../supabase/supabase.types.js';
import type {
  CollectionPageQuery,
  SetStickerQuantityInput
} from '../collections.types.js';

@Injectable()
export class CollectionsRepository {
  public constructor(
    @Inject(SupabaseService)
    private readonly supabaseService: SupabaseService
  ) {}

  public setStickerQuantity(
    input: SetStickerQuantityInput
  ): Promise<SupabaseCollectionItemRow> {
    return this.supabaseService
      .createUserClient(input.accessToken)
      .upsertCollectionItem(input);
  }

  public getSticker(
    accessToken: string,
    stickerId: string
  ): Promise<SupabaseStickerRow> {
    return this.supabaseService
      .createUserClient(accessToken)
      .getSticker(stickerId);
  }

  public findStickerByCode(input: {
    readonly accessToken: string;
    readonly albumId: string;
    readonly code: string;
  }): Promise<SupabaseStickerRow | null> {
    return this.supabaseService
      .createUserClient(input.accessToken)
      .findStickerByCode({
        albumId: input.albumId,
        code: input.code
      });
  }

  public getCollectionItem(input: {
    readonly accessToken: string;
    readonly userId: string;
    readonly stickerId: string;
  }): Promise<SupabaseCollectionItemRow | null> {
    return this.supabaseService
      .createUserClient(input.accessToken)
      .getCollectionItem(input);
  }

  public listAlbumStickers(
    accessToken: string,
    query: Pick<CollectionPageQuery, 'albumId' | 'sectionId'>
  ): Promise<readonly SupabaseStickerRow[]> {
    return this.supabaseService
      .createUserClient(accessToken)
      .listAlbumStickersForCollection(query);
  }

  public listCollectionStickers(
    accessToken: string,
    query: CollectionPageQuery
  ): Promise<readonly SupabaseStickerRow[]> {
    return this.supabaseService
      .createUserClient(accessToken)
      .listCollectionStickers(query);
  }

  public listAlbumCollectionItems(input: {
    readonly accessToken: string;
    readonly userId: string;
    readonly albumId: string;
  }): Promise<readonly SupabaseCollectionItemRow[]> {
    return this.supabaseService
      .createUserClient(input.accessToken)
      .listAlbumCollectionItems(input);
  }

  public listCollectionItemsByStickerIds(input: {
    readonly accessToken: string;
    readonly userId: string;
    readonly stickerIds: readonly string[];
  }): Promise<readonly SupabaseCollectionItemRow[]> {
    return this.supabaseService
      .createUserClient(input.accessToken)
      .listCollectionItemsByStickerIds(input);
  }

  public listAlbumSections(
    accessToken: string,
    albumId: string
  ): Promise<readonly SupabaseAlbumSectionRow[]> {
    return this.supabaseService
      .createUserClient(accessToken)
      .listAlbumSections(albumId);
  }

  public getAlbumSection(input: {
    readonly accessToken: string;
    readonly albumId: string;
    readonly sectionId: string;
  }): Promise<SupabaseAlbumSectionRow> {
    return this.supabaseService
      .createUserClient(input.accessToken)
      .getAlbumSection(input);
  }
}
