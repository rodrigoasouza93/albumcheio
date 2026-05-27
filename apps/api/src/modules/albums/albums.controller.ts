import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
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
  parseRequiredUuid,
  parseUpdateAlbumInput,
  parseUpdateAlbumSectionInput,
  parseUpdateAlbumStatusInput
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

  @Patch(':albumId')
  @UseGuards(AdminGuard)
  public updateAlbum(
    @Req() request: AuthenticatedRequest,
    @Param('albumId') albumId: string | undefined,
    @Body() body: unknown
  ): Promise<AlbumSummary> {
    return this.albumsService.updateAlbum(
      parseUpdateAlbumInput(
        body,
        parseRequiredUuid(albumId, 'albumId'),
        request.user.accessToken
      )
    );
  }

  @Delete(':albumId')
  @UseGuards(AdminGuard)
  public archiveAlbum(
    @Req() request: AuthenticatedRequest,
    @Param('albumId') albumId: string | undefined
  ): Promise<AlbumSummary> {
    return this.albumsService.archiveAlbum({
      accessToken: request.user.accessToken,
      albumId: parseRequiredUuid(albumId, 'albumId')
    });
  }

  @Patch(':albumId/status')
  @UseGuards(AdminGuard)
  public updateAlbumStatus(
    @Req() request: AuthenticatedRequest,
    @Param('albumId') albumId: string | undefined,
    @Body() body: unknown
  ): Promise<AlbumSummary> {
    return this.albumsService.updateAlbumStatus(
      parseUpdateAlbumStatusInput(
        body,
        parseRequiredUuid(albumId, 'albumId'),
        request.user.accessToken
      )
    );
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

  @Patch(':albumId/sections/:sectionId')
  @UseGuards(AdminGuard)
  public updateSection(
    @Req() request: AuthenticatedRequest,
    @Param('albumId') albumId: string | undefined,
    @Param('sectionId') sectionId: string | undefined,
    @Body() body: unknown
  ): Promise<AlbumSectionSummary> {
    return this.albumsService.updateSection(
      parseUpdateAlbumSectionInput(
        body,
        parseRequiredUuid(albumId, 'albumId'),
        parseRequiredUuid(sectionId, 'sectionId'),
        request.user.accessToken
      )
    );
  }

  @Delete(':albumId/sections/:sectionId')
  @UseGuards(AdminGuard)
  public deleteSection(
    @Req() request: AuthenticatedRequest,
    @Param('albumId') albumId: string | undefined,
    @Param('sectionId') sectionId: string | undefined
  ): Promise<void> {
    return this.albumsService.deleteSection({
      accessToken: request.user.accessToken,
      albumId: parseRequiredUuid(albumId, 'albumId'),
      sectionId: parseRequiredUuid(sectionId, 'sectionId')
    });
  }
}
