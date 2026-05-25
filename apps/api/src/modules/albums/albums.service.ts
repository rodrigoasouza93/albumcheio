import { Inject, Injectable } from '@nestjs/common';

import { mapSupabaseError } from '../auth/supabase-error.mapper.js';
import type {
  SupabaseAlbumRow,
  SupabaseAlbumSectionRow
} from '../supabase/supabase.types.js';
import { AlbumsRepository } from './data/albums.repository.js';
import type {
  AlbumDetail,
  AlbumPage,
  AlbumSectionKind,
  AlbumSectionSummary,
  AlbumSummary,
  CreateAlbumInput,
  CreateAlbumSectionInput,
  PageQuery
} from './albums.types.js';

@Injectable()
export class AlbumsService {
  public constructor(
    @Inject(AlbumsRepository)
    private readonly albumsRepository: AlbumsRepository
  ) {}

  public async createAlbum(input: CreateAlbumInput): Promise<AlbumSummary> {
    try {
      const album = await this.albumsRepository.createAlbum(input);

      return this.mapAlbum(album);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  }

  public async listAlbums(input: {
    readonly accessToken: string;
    readonly page: PageQuery;
  }): Promise<AlbumPage> {
    try {
      const albums = await this.albumsRepository.listAlbums(
        input.accessToken,
        input.page
      );

      return {
        items: albums.map((album) => this.mapAlbum(album)),
        ...input.page
      };
    } catch (error) {
      throw mapSupabaseError(error);
    }
  }

  public async getAlbumDetail(input: {
    readonly accessToken: string;
    readonly albumId: string;
  }): Promise<AlbumDetail> {
    try {
      const album = await this.albumsRepository.getAlbum(
        input.accessToken,
        input.albumId
      );
      const sections = await this.albumsRepository.listSections(
        input.accessToken,
        input.albumId
      );

      return {
        ...this.mapAlbum(album),
        sections: sections.map((section) => this.mapSection(section))
      };
    } catch (error) {
      throw mapSupabaseError(error);
    }
  }

  public async createSection(
    input: CreateAlbumSectionInput
  ): Promise<AlbumSectionSummary> {
    try {
      const section = await this.albumsRepository.createSection(input);

      return this.mapSection(section);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  }

  private mapAlbum(album: SupabaseAlbumRow): AlbumSummary {
    return {
      id: album.id,
      name: album.name,
      edition: album.edition,
      description: album.description,
      status: album.status,
      createdBy: album.created_by,
      createdAt: album.created_at,
      updatedAt: album.updated_at
    };
  }

  private mapSection(section: SupabaseAlbumSectionRow): AlbumSectionSummary {
    return {
      id: section.id,
      albumId: section.album_id,
      name: section.name,
      code: section.code,
      kind: section.kind as AlbumSectionKind,
      sortOrder: section.sort_order,
      createdAt: section.created_at,
      updatedAt: section.updated_at
    };
  }
}
