import { Inject, Injectable } from '@nestjs/common';

import { SupabaseService } from '../../supabase/supabase.service.js';
import type {
  SupabaseAlbumRow,
  SupabaseAlbumSectionRow
} from '../../supabase/supabase.types.js';
import type {
  CreateAlbumInput,
  CreateAlbumSectionInput,
  PageQuery
} from '../albums.types.js';

@Injectable()
export class AlbumsRepository {
  public constructor(
    @Inject(SupabaseService)
    private readonly supabaseService: SupabaseService
  ) {}

  public createAlbum(input: CreateAlbumInput): Promise<SupabaseAlbumRow> {
    return this.supabaseService
      .createUserClient(input.accessToken)
      .insertAlbum({
        name: input.name,
        edition: input.edition,
        description: input.description,
        createdBy: input.userId
      });
  }

  public listAlbums(
    accessToken: string,
    page: PageQuery
  ): Promise<readonly SupabaseAlbumRow[]> {
    return this.supabaseService.createUserClient(accessToken).listAlbums(page);
  }

  public getAlbum(
    accessToken: string,
    albumId: string
  ): Promise<SupabaseAlbumRow> {
    return this.supabaseService.createUserClient(accessToken).getAlbum(albumId);
  }

  public createSection(
    input: CreateAlbumSectionInput
  ): Promise<SupabaseAlbumSectionRow> {
    return this.supabaseService
      .createUserClient(input.accessToken)
      .insertAlbumSection(input);
  }

  public listSections(
    accessToken: string,
    albumId: string
  ): Promise<readonly SupabaseAlbumSectionRow[]> {
    return this.supabaseService
      .createUserClient(accessToken)
      .listAlbumSections(albumId);
  }
}
