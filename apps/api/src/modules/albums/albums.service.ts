import { Inject, Injectable } from '@nestjs/common';

import { mapSupabaseError } from '../auth/supabase-error.mapper.js';
import { MetricsService } from '../observability/metrics.service.js';
import { StructuredLoggerService } from '../observability/structured-logger.service.js';
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
  AlbumStatus,
  AlbumSummary,
  CreateAlbumInput,
  CreateAlbumSectionInput,
  PageQuery,
  UpdateAlbumInput,
  UpdateAlbumSectionInput,
  UpdateAlbumStatusInput
} from './albums.types.js';
import type { CatalogActor, ProfileRole } from './albums.types.js';

@Injectable()
export class AlbumsService {
  public constructor(
    @Inject(AlbumsRepository)
    private readonly albumsRepository: AlbumsRepository,
    private readonly metricsService: MetricsService,
    private readonly logger: StructuredLoggerService
  ) {}

  public async createAlbum(input: CreateAlbumInput): Promise<AlbumSummary> {
    try {
      const album = await this.albumsRepository.createAlbum(input);
      this.recordAdminMutation(input.actor, {
        resource: 'album',
        action: 'create',
        outcome: 'success',
        albumId: album.id
      });

      return this.mapAlbum(album);
    } catch (error) {
      this.recordAdminMutation(input.actor, {
        resource: 'album',
        action: 'create',
        outcome: 'failure'
      });
      throw mapSupabaseError(error);
    }
  }

  public async listAlbums(input: {
    readonly accessToken: string;
    readonly userId: string;
    readonly role: ProfileRole;
    readonly page: PageQuery;
  }): Promise<AlbumPage> {
    try {
      const albums = await this.albumsRepository.listAlbums(
        input.accessToken,
        input.page
      );

      const items = albums.map((album) => this.mapAlbum(album));

      items.forEach((album) => {
        this.recordAlbumRead({
          userId: input.userId,
          role: input.role,
          status: album.status,
          outcome: 'success',
          albumId: album.id
        });
      });

      if (items.length === 0) {
        this.metricsService.recordCatalogAlbumRead({
          status: 'none',
          role: input.role,
          outcome: 'empty'
        });
      }

      return {
        items,
        ...input.page
      };
    } catch (error) {
      this.metricsService.recordCatalogAlbumRead({
        status: 'unknown',
        role: input.role,
        outcome: 'failure'
      });
      throw mapSupabaseError(error);
    }
  }

  public async getAlbumDetail(input: {
    readonly accessToken: string;
    readonly userId: string;
    readonly role: ProfileRole;
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

      this.recordAlbumRead({
        userId: input.userId,
        role: input.role,
        status: album.status,
        outcome: 'success',
        albumId: album.id
      });

      return {
        ...this.mapAlbum(album),
        sections: sections.map((section) => this.mapSection(section))
      };
    } catch (error) {
      this.metricsService.recordCatalogAlbumRead({
        status: 'unknown',
        role: input.role,
        outcome: 'failure'
      });
      throw mapSupabaseError(error);
    }
  }

  public async createSection(
    input: CreateAlbumSectionInput
  ): Promise<AlbumSectionSummary> {
    try {
      const section = await this.albumsRepository.createSection(input);
      this.recordAdminMutation(input.actor, {
        resource: 'section',
        action: 'create',
        outcome: 'success',
        albumId: input.albumId
      });

      return this.mapSection(section);
    } catch (error) {
      this.recordAdminMutation(input.actor, {
        resource: 'section',
        action: 'create',
        outcome: 'failure',
        albumId: input.albumId
      });
      throw mapSupabaseError(error);
    }
  }

  public async updateAlbum(input: UpdateAlbumInput): Promise<AlbumSummary> {
    try {
      const album = await this.albumsRepository.updateAlbum(input);
      this.recordAdminMutation(input.actor, {
        resource: 'album',
        action: 'update',
        outcome: 'success',
        albumId: input.albumId
      });

      return this.mapAlbum(album);
    } catch (error) {
      this.recordAdminMutation(input.actor, {
        resource: 'album',
        action: 'update',
        outcome: 'failure',
        albumId: input.albumId
      });
      throw mapSupabaseError(error);
    }
  }

  public async updateAlbumStatus(
    input: UpdateAlbumStatusInput
  ): Promise<AlbumSummary> {
    try {
      const album = await this.albumsRepository.updateAlbumStatus(input);
      this.recordAdminMutation(input.actor, {
        resource: 'album',
        action: 'status',
        outcome: 'success',
        albumId: input.albumId
      });

      return this.mapAlbum(album);
    } catch (error) {
      this.recordAdminMutation(input.actor, {
        resource: 'album',
        action: 'status',
        outcome: 'failure',
        albumId: input.albumId
      });
      throw mapSupabaseError(error);
    }
  }

  public archiveAlbum(input: {
    readonly accessToken: string;
    readonly actor?: CatalogActor;
    readonly albumId: string;
  }): Promise<AlbumSummary> {
    return this.updateAlbumStatus({
      ...input,
      status: 'archived'
    });
  }

  public async updateSection(
    input: UpdateAlbumSectionInput
  ): Promise<AlbumSectionSummary> {
    try {
      const section = await this.albumsRepository.updateSection(input);
      this.recordAdminMutation(input.actor, {
        resource: 'section',
        action: 'update',
        outcome: 'success',
        albumId: input.albumId
      });

      return this.mapSection(section);
    } catch (error) {
      this.recordAdminMutation(input.actor, {
        resource: 'section',
        action: 'update',
        outcome: 'failure',
        albumId: input.albumId
      });
      throw mapSupabaseError(error);
    }
  }

  public async deleteSection(input: {
    readonly accessToken: string;
    readonly actor?: CatalogActor;
    readonly albumId: string;
    readonly sectionId: string;
  }): Promise<void> {
    try {
      await this.albumsRepository.deleteSection(input);
      this.recordAdminMutation(input.actor, {
        resource: 'section',
        action: 'delete',
        outcome: 'success',
        albumId: input.albumId
      });
    } catch (error) {
      this.recordAdminMutation(input.actor, {
        resource: 'section',
        action: 'delete',
        outcome: 'failure',
        albumId: input.albumId
      });
      throw mapSupabaseError(error);
    }
  }

  private recordAdminMutation(
    actor: CatalogActor | undefined,
    input: {
      readonly resource: string;
      readonly action: string;
      readonly outcome: string;
      readonly albumId?: string;
    }
  ): void {
    this.metricsService.recordCatalogAdminMutation(input);

    if (!actor) {
      return;
    }

    this.logger.logCatalogAdminMutation({
      userId: actor.userId,
      role: actor.role,
      ...input
    });
  }

  private recordAlbumRead(input: {
    readonly userId: string;
    readonly role: ProfileRole;
    readonly status: string;
    readonly outcome: string;
    readonly albumId: string;
  }): void {
    this.metricsService.recordCatalogAlbumRead({
      status: input.status,
      role: input.role,
      outcome: input.outcome
    });
    this.logger.logCatalogAlbumRead({
      userId: input.userId,
      role: input.role,
      resource: 'album',
      action: 'read',
      outcome: input.outcome,
      albumId: input.albumId
    });
  }

  private mapAlbum(album: SupabaseAlbumRow): AlbumSummary {
    return {
      id: album.id,
      name: album.name,
      edition: album.edition,
      description: album.description,
      status: album.status as AlbumStatus,
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
