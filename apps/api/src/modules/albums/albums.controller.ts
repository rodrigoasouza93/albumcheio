import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';

import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';
import { AdminGuard } from '../auth/admin.guard.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { AlbumsService } from './albums.service.js';
import type {
  AlbumDetail,
  AlbumPage,
  AlbumSectionSummary,
  AlbumSummary
} from './albums.types.js';
import {
  parseCreateAlbumInput,
  parseCreateAlbumSectionInput,
  parsePageQuery,
  parseRequiredUuid
} from './albums.validation.js';

interface AuthenticatedRequest {
  readonly user: AuthenticatedUser;
}

@UseGuards(SupabaseAuthGuard)
@Controller('albums')
export class AlbumsController {
  public constructor(
    @Inject(AlbumsService)
    private readonly albumsService: AlbumsService
  ) {}

  @Get()
  public listAlbums(
    @Req() request: AuthenticatedRequest,
    @Query() query: Record<string, unknown>
  ): Promise<AlbumPage> {
    return this.albumsService.listAlbums({
      accessToken: request.user.accessToken,
      page: parsePageQuery(query)
    });
  }

  @Post()
  @UseGuards(AdminGuard)
  public createAlbum(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown
  ): Promise<AlbumSummary> {
    return this.albumsService.createAlbum(
      parseCreateAlbumInput(body, {
        userId: request.user.id,
        accessToken: request.user.accessToken
      })
    );
  }

  @Get(':albumId')
  public getAlbumDetail(
    @Req() request: AuthenticatedRequest,
    @Param('albumId') albumId: string | undefined
  ): Promise<AlbumDetail> {
    return this.albumsService.getAlbumDetail({
      accessToken: request.user.accessToken,
      albumId: parseRequiredUuid(albumId, 'albumId')
    });
  }

  @Post(':albumId/sections')
  @UseGuards(AdminGuard)
  public createSection(
    @Req() request: AuthenticatedRequest,
    @Param('albumId') albumId: string | undefined,
    @Body() body: unknown
  ): Promise<AlbumSectionSummary> {
    return this.albumsService.createSection(
      parseCreateAlbumSectionInput(
        body,
        parseRequiredUuid(albumId, 'albumId'),
        request.user.accessToken
      )
    );
  }
}
