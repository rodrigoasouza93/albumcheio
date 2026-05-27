import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/auth.types.js';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';
import { parseRequiredUuid } from '../albums/albums.validation.js';
import { CollectionsService } from './collections.service.js';
import type {
  AlbumProgress,
  CollectionStickerPage,
  CollectionItemSummary,
  DuplicateStickerPage,
  MissingStickerPage,
  StickerCollectionStatus
} from './collections.types.js';
import {
  parseCollectionPageQuery,
  parseSearchCollectionInput,
  parseSetStickerQuantityInput
} from './collections.validation.js';

interface AuthenticatedRequest {
  readonly user: AuthenticatedUser;
}

@UseGuards(SupabaseAuthGuard)
@Controller()
export class CollectionsController {
  public constructor(
    @Inject(CollectionsService)
    private readonly collectionsService: CollectionsService
  ) {}

  @Patch('collection-items/:stickerId')
  public setStickerQuantity(
    @Req() request: AuthenticatedRequest,
    @Param('stickerId') stickerId: string | undefined,
    @Body() body: unknown
  ): Promise<CollectionItemSummary> {
    return this.collectionsService.setStickerQuantity(
      parseSetStickerQuantityInput(body, stickerId, {
        userId: request.user.id,
        accessToken: request.user.accessToken
      })
    );
  }

  @Get('albums/:albumId/collection/search')
  public searchSticker(
    @Req() request: AuthenticatedRequest,
    @Param('albumId') albumId: string | undefined,
    @Query() query: Record<string, unknown>
  ): Promise<StickerCollectionStatus> {
    return this.collectionsService.searchSticker(
      parseSearchCollectionInput(query, albumId, {
        userId: request.user.id,
        accessToken: request.user.accessToken
      })
    );
  }

  @Get('albums/:albumId/collection/stickers')
  public listCollectionStickers(
    @Req() request: AuthenticatedRequest,
    @Param('albumId') albumId: string | undefined,
    @Query() query: Record<string, unknown>
  ): Promise<CollectionStickerPage> {
    return this.collectionsService.listCollectionStickers({
      accessToken: request.user.accessToken,
      userId: request.user.id,
      query: parseCollectionPageQuery(query, albumId)
    });
  }

  @Get('albums/:albumId/progress')
  public getAlbumProgress(
    @Req() request: AuthenticatedRequest,
    @Param('albumId') albumId: string | undefined
  ): Promise<AlbumProgress> {
    return this.collectionsService.getAlbumProgress({
      accessToken: request.user.accessToken,
      userId: request.user.id,
      albumId: parseRequiredUuid(albumId, 'albumId')
    });
  }

  @Get('albums/:albumId/missing')
  public listMissing(
    @Req() request: AuthenticatedRequest,
    @Param('albumId') albumId: string | undefined,
    @Query() query: Record<string, unknown>
  ): Promise<MissingStickerPage> {
    return this.collectionsService.listMissing({
      accessToken: request.user.accessToken,
      userId: request.user.id,
      query: parseCollectionPageQuery(query, albumId)
    });
  }

  @Get('albums/:albumId/duplicates')
  public listDuplicates(
    @Req() request: AuthenticatedRequest,
    @Param('albumId') albumId: string | undefined,
    @Query() query: Record<string, unknown>
  ): Promise<DuplicateStickerPage> {
    return this.collectionsService.listDuplicates({
      accessToken: request.user.accessToken,
      userId: request.user.id,
      query: parseCollectionPageQuery(query, albumId)
    });
  }
}
