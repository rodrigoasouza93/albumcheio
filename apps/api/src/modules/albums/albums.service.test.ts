import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { SupabaseApiError } from '../supabase/supabase-api.error.js';
import type { MetricsService } from '../observability/metrics.service.js';
import type { StructuredLoggerService } from '../observability/structured-logger.service.js';
import type { AlbumsRepository } from './data/albums.repository.js';
import { AlbumsService } from './albums.service.js';

const albumRow = {
  id: 'album-id',
  name: 'World Football',
  edition: '2026',
  description: 'Album description',
  created_by: 'user-id',
  status: 'draft',
  created_at: '2026-05-25T10:00:00.000Z',
  updated_at: '2026-05-25T10:00:00.000Z'
};

const sectionRow = {
  id: 'section-id',
  album_id: 'album-id',
  name: 'Brazil',
  code: 'BRA',
  kind: 'team',
  sort_order: 10,
  created_at: '2026-05-25T10:00:00.000Z',
  updated_at: '2026-05-25T10:00:00.000Z'
};

const createObservability = () => ({
  metricsService: {
    recordCatalogAdminMutation: vi.fn(),
    recordCatalogAlbumRead: vi.fn()
  } as unknown as MetricsService,
  logger: {
    logCatalogAdminMutation: vi.fn(),
    logCatalogAlbumRead: vi.fn()
  } as unknown as StructuredLoggerService
});

const createService = (repository: AlbumsRepository): AlbumsService => {
  const { metricsService, logger } = createObservability();

  return new AlbumsService(repository, metricsService, logger);
};

describe('AlbumsService', () => {
  it('creates an album and maps API fields', async () => {
    const repository = {
      createAlbum: vi.fn().mockResolvedValue(albumRow)
    } as unknown as AlbumsRepository;
    const service = createService(repository);

    const album = await service.createAlbum({
      userId: 'user-id',
      accessToken: 'access-token',
      name: 'World Football',
      edition: '2026',
      description: 'Album description'
    });

    expect(album).toEqual({
      id: 'album-id',
      name: 'World Football',
      edition: '2026',
      description: 'Album description',
      createdBy: 'user-id',
      status: 'draft',
      createdAt: '2026-05-25T10:00:00.000Z',
      updatedAt: '2026-05-25T10:00:00.000Z'
    });
  });

  it('returns album detail with summarized sections', async () => {
    const repository = {
      getAlbum: vi.fn().mockResolvedValue(albumRow),
      listSections: vi.fn().mockResolvedValue([sectionRow])
    } as unknown as AlbumsRepository;
    const service = createService(repository);

    const detail = await service.getAlbumDetail({
      accessToken: 'access-token',
      userId: 'user-id',
      role: 'admin',
      albumId: 'album-id'
    });

    expect(detail.sections).toEqual([
      {
        id: 'section-id',
        albumId: 'album-id',
        name: 'Brazil',
        code: 'BRA',
        kind: 'team',
        sortOrder: 10,
        createdAt: '2026-05-25T10:00:00.000Z',
        updatedAt: '2026-05-25T10:00:00.000Z'
      }
    ]);
  });

  it('maps catalog uniqueness errors to conflict responses', async () => {
    const repository = {
      createSection: vi
        .fn()
        .mockRejectedValue(
          new SupabaseApiError(400, 'duplicate key value', '23505')
        )
    } as unknown as AlbumsRepository;
    const service = createService(repository);

    await expect(
      service.createSection({
        accessToken: 'access-token',
        albumId: 'album-id',
        name: 'Brazil',
        code: 'BRA',
        kind: 'team',
        sortOrder: 10
      })
    ).rejects.toThrow(ConflictException);
  });

  it('updates album status through repository', async () => {
    const updateAlbumStatus = vi.fn().mockResolvedValue({
      ...albumRow,
      status: 'published'
    });
    const repository = {
      updateAlbumStatus
    } as unknown as AlbumsRepository;
    const service = createService(repository);

    const album = await service.updateAlbumStatus({
      accessToken: 'access-token',
      albumId: 'album-id',
      status: 'published'
    });

    expect(updateAlbumStatus).toHaveBeenCalledWith({
      accessToken: 'access-token',
      albumId: 'album-id',
      status: 'published'
    });
    expect(album.status).toBe('published');
  });

  it('archives albums instead of physically deleting them', async () => {
    const updateAlbumStatus = vi.fn().mockResolvedValue({
      ...albumRow,
      status: 'archived'
    });
    const repository = {
      updateAlbumStatus
    } as unknown as AlbumsRepository;
    const service = createService(repository);

    const album = await service.archiveAlbum({
      accessToken: 'access-token',
      albumId: 'album-id'
    });

    expect(updateAlbumStatus).toHaveBeenCalledWith({
      accessToken: 'access-token',
      albumId: 'album-id',
      status: 'archived'
    });
    expect(album.status).toBe('archived');
  });

  it('updates sections through repository', async () => {
    const repository = {
      updateSection: vi.fn().mockResolvedValue({
        ...sectionRow,
        code: 'ARG'
      })
    } as unknown as AlbumsRepository;
    const service = createService(repository);

    const section = await service.updateSection({
      accessToken: 'access-token',
      albumId: 'album-id',
      sectionId: 'section-id',
      code: 'ARG'
    });

    expect(section.code).toBe('ARG');
  });
});
