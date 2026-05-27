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
import { CollectionsController } from './collections.controller.js';

const albumId = '00000000-0000-4000-8000-000000000001';
const sectionId = '00000000-0000-4000-8000-000000000101';
const stickerId = '00000000-0000-4000-8000-000000001001';
const timestamp = '2026-05-25T10:00:00.000Z';
const userA = {
  id: '00000000-0000-4000-8000-000000000901',
  email: 'a@example.com',
  accessToken: 'access-token-a'
};
const userB = {
  id: '00000000-0000-4000-8000-000000000902',
  email: 'b@example.com',
  accessToken: 'access-token-b'
};
const stickerRow = {
  id: stickerId,
  album_id: albumId,
  section_id: sectionId,
  code: 'BRA01',
  number: 1,
  title: 'Brazil Badge',
  sort_order: 10,
  created_at: timestamp,
  updated_at: timestamp
};
const collectionItemRow = {
  id: '00000000-0000-4000-8000-000000002001',
  user_id: userA.id,
  sticker_id: stickerId,
  quantity_total: 2,
  created_at: timestamp,
  updated_at: timestamp
};

describe('collection endpoints', () => {
  let app: INestApplication;
  let collectionsController: CollectionsController;
  const userClient = {
    getSticker: vi.fn(),
    upsertCollectionItem: vi.fn(),
    findStickerByCode: vi.fn(),
    getCollectionItem: vi.fn(),
    listAlbumStickersForCollection: vi.fn(),
    listCollectionStickers: vi.fn(),
    listCollectionItemsByStickerIds: vi.fn(),
    listAlbumCollectionItems: vi.fn(),
    listAlbumSections: vi.fn(),
    getAlbumSection: vi.fn()
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
    collectionsController = moduleRef.get(CollectionsController);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    userClient.getSticker.mockResolvedValue(stickerRow);
    userClient.upsertCollectionItem.mockResolvedValue(collectionItemRow);
    userClient.findStickerByCode.mockResolvedValue(stickerRow);
    userClient.getCollectionItem.mockResolvedValue(collectionItemRow);
    userClient.listAlbumStickersForCollection.mockResolvedValue([stickerRow]);
    userClient.listCollectionStickers.mockResolvedValue([stickerRow]);
    userClient.listCollectionItemsByStickerIds.mockResolvedValue([
      collectionItemRow
    ]);
    userClient.listAlbumCollectionItems.mockResolvedValue([collectionItemRow]);
    userClient.listAlbumSections.mockResolvedValue([
      {
        id: sectionId,
        album_id: albumId,
        name: 'Brazil',
        code: 'BRA',
        kind: 'team',
        sort_order: 10,
        created_at: timestamp,
        updated_at: timestamp
      }
    ]);
    userClient.getAlbumSection.mockResolvedValue({
      id: sectionId,
      album_id: albumId,
      name: 'Brazil',
      code: 'BRA',
      kind: 'team',
      sort_order: 10,
      created_at: timestamp,
      updated_at: timestamp
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('updates quantity with the authenticated user identity', async () => {
    const response = await collectionsController.setStickerQuantity(
      { user: userA },
      stickerId,
      {
        quantityTotal: 2
      }
    );

    expect(response).toMatchObject({
      userId: userA.id,
      stickerId,
      quantityTotal: 2,
      duplicateCount: 1
    });
    expect(userClient.upsertCollectionItem).toHaveBeenCalledWith({
      accessToken: userA.accessToken,
      userId: userA.id,
      stickerId,
      quantityTotal: 2
    });
  });

  it('searches and lists collection data using each authenticated user', async () => {
    await collectionsController.searchSticker({ user: userA }, albumId, {
      code: ' bra01 '
    });
    await collectionsController.listDuplicates({ user: userB }, albumId, {
      sectionId,
      limit: '5',
      offset: '0'
    });

    expect(userClient.findStickerByCode).toHaveBeenCalledWith({
      albumId,
      code: 'BRA01'
    });
    expect(supabaseService.createUserClient).toHaveBeenCalledWith(
      userA.accessToken
    );
    expect(userClient.listAlbumCollectionItems).toHaveBeenLastCalledWith({
      accessToken: userB.accessToken,
      userId: userB.id,
      albumId
    });
  });

  it('lists collection stickers with section filter for authenticated user', async () => {
    const response = await collectionsController.listCollectionStickers(
      { user: userA },
      albumId,
      {
        sectionId,
        limit: '5',
        offset: '0'
      }
    );

    expect(response.items).toEqual([
      expect.objectContaining({
        id: stickerId,
        quantityTotal: 2,
        owned: true,
        duplicateCount: 1,
        status: 'duplicate'
      })
    ]);
    expect(userClient.getAlbumSection).toHaveBeenCalledWith({
      accessToken: userA.accessToken,
      albumId,
      sectionId
    });
    expect(userClient.listCollectionStickers).toHaveBeenCalledWith({
      albumId,
      sectionId,
      limit: 5,
      offset: 0
    });
    expect(userClient.listCollectionItemsByStickerIds).toHaveBeenCalledWith({
      accessToken: userA.accessToken,
      userId: userA.id,
      stickerIds: [stickerId]
    });
  });

  it('lists consolidated collection stickers without validating a section', async () => {
    await collectionsController.listCollectionStickers({ user: userA }, albumId, {
      limit: '5',
      offset: '0'
    });

    expect(userClient.getAlbumSection).not.toHaveBeenCalled();
    expect(userClient.listCollectionStickers).toHaveBeenCalledWith({
      albumId,
      limit: 5,
      offset: 0
    });
  });
});
