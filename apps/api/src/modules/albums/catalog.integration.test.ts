import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { AppModule } from '../app.module.js';
import type { SupabaseClient } from '../supabase/supabase-client.js';
import { SupabaseService } from '../supabase/supabase.service.js';
import { AlbumsController } from './albums.controller.js';
import { StickersController } from '../stickers/stickers.controller.js';

const user = {
  id: '00000000-0000-4000-8000-000000000999',
  email: 'user@example.com',
  accessToken: 'access-token'
};
const albumId = '00000000-0000-4000-8000-000000000001';
const sectionId = '00000000-0000-4000-8000-000000000101';
const stickerId = '00000000-0000-4000-8000-000000001001';
const timestamp = '2026-05-25T10:00:00.000Z';

const albumRow = {
  id: albumId,
  name: 'World Football',
  edition: '2026',
  description: 'Album description',
  created_by: user.id,
  status: 'draft',
  created_at: timestamp,
  updated_at: timestamp
};
const sectionRow = {
  id: sectionId,
  album_id: albumId,
  name: 'Brazil',
  code: 'BRA',
  kind: 'team',
  sort_order: 10,
  created_at: timestamp,
  updated_at: timestamp
};
const stickerRow = {
  id: stickerId,
  album_id: albumId,
  section_id: sectionId,
  code: 'BRA01',
  number: 1,
  title: 'Brazil Badge',
  sort_order: 20,
  created_at: timestamp,
  updated_at: timestamp
};

describe('catalog endpoints', () => {
  let app: INestApplication;
  let albumsController: AlbumsController;
  let stickersController: StickersController;
  const userClient = {
    insertAlbum: vi.fn(),
    listAlbums: vi.fn(),
    getAlbum: vi.fn(),
    insertAlbumSection: vi.fn(),
    listAlbumSections: vi.fn(),
    insertSticker: vi.fn(),
    listStickers: vi.fn()
  };
  const supabaseService = {
    createAuthClient: vi.fn(),
    createUserClient: vi.fn(() => userClient as unknown as SupabaseClient),
    createAdminClient: vi.fn()
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(SupabaseService)
      .useValue(supabaseService)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    albumsController = moduleRef.get(AlbumsController);
    stickersController = moduleRef.get(StickersController);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    userClient.insertAlbum.mockResolvedValue(albumRow);
    userClient.listAlbums.mockResolvedValue([albumRow]);
    userClient.getAlbum.mockResolvedValue(albumRow);
    userClient.insertAlbumSection.mockResolvedValue(sectionRow);
    userClient.listAlbumSections.mockResolvedValue([sectionRow]);
    userClient.insertSticker.mockResolvedValue(stickerRow);
    userClient.listStickers.mockResolvedValue([stickerRow]);
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates album, section, and sticker through authenticated controllers', async () => {
    const request = { user };
    const album = await albumsController.createAlbum(request, {
      name: 'World Football',
      edition: '2026',
      description: 'Album description'
    });
    const section = await albumsController.createSection(request, albumId, {
      name: 'Brazil',
      code: ' bra ',
      kind: 'team',
      sortOrder: 10
    });
    const sticker = await stickersController.createSticker(request, albumId, {
      sectionId,
      code: ' bra01 ',
      number: 1,
      title: 'Brazil Badge',
      sortOrder: 20
    });

    expect(album.id).toBe(albumId);
    expect(section.code).toBe('BRA');
    expect(sticker.code).toBe('BRA01');
    expect(userClient.insertSticker).toHaveBeenCalledWith({
      accessToken: 'access-token',
      albumId,
      sectionId,
      code: 'BRA01',
      number: 1,
      title: 'Brazil Badge',
      sortOrder: 20
    });
  });

  it('lists albums, album detail, and filtered stickers with pagination', async () => {
    const request = { user };

    const albums = await albumsController.listAlbums(request, {
      limit: '5',
      offset: '10'
    });
    const detail = await albumsController.getAlbumDetail(request, albumId);
    const stickers = await stickersController.listStickers(request, albumId, {
      sectionId,
      code: ' bra01 ',
      limit: '5',
      offset: '10'
    });

    expect(albums).toMatchObject({
      limit: 5,
      offset: 10
    });
    expect(detail.sections).toHaveLength(1);
    expect(stickers).toMatchObject({
      limit: 5,
      offset: 10
    });
    expect(userClient.listStickers).toHaveBeenCalledWith({
      albumId,
      sectionId,
      code: 'BRA01',
      limit: 5,
      offset: 10
    });
  });
});
