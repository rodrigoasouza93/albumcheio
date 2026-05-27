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

import { parseRequiredUuid } from '../albums/albums.validation.js';
import { AdminGuard } from '../auth/admin.guard.js';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { StickersService } from './stickers.service.js';
import type { StickerPage, StickerSummary } from './stickers.types.js';
import {
  parseCreateStickerInput,
  parseStickerFilter,
  parseUpdateStickerInput
} from './stickers.validation.js';

interface AuthenticatedRequest {
  readonly user: AuthenticatedUser;
}

@UseGuards(SupabaseAuthGuard)
@Controller('albums/:albumId/stickers')
export class StickersController {
  public constructor(
    @Inject(StickersService)
    private readonly stickersService: StickersService
  ) {}

  @Get()
  public listStickers(
    @Req() request: AuthenticatedRequest,
    @Param('albumId') albumId: string | undefined,
    @Query() query: Record<string, unknown>
  ): Promise<StickerPage> {
    const parsedAlbumId = parseRequiredUuid(albumId, 'albumId');

    return this.stickersService.listStickers({
      accessToken: request.user.accessToken,
      filter: parseStickerFilter(query, parsedAlbumId)
    });
  }

  @Post()
  @UseGuards(AdminGuard)
  public createSticker(
    @Req() request: AuthenticatedRequest,
    @Param('albumId') albumId: string | undefined,
    @Body() body: unknown
  ): Promise<StickerSummary> {
    return this.stickersService.createSticker(
      parseCreateStickerInput(
        body,
        parseRequiredUuid(albumId, 'albumId'),
        request.user.accessToken,
        {
          userId: request.user.id,
          role: request.user.role
        }
      )
    );
  }

  @Patch(':stickerId')
  @UseGuards(AdminGuard)
  public updateSticker(
    @Req() request: AuthenticatedRequest,
    @Param('albumId') albumId: string | undefined,
    @Param('stickerId') stickerId: string | undefined,
    @Body() body: unknown
  ): Promise<StickerSummary> {
    return this.stickersService.updateSticker(
      parseUpdateStickerInput(
        body,
        parseRequiredUuid(albumId, 'albumId'),
        parseRequiredUuid(stickerId, 'stickerId'),
        request.user.accessToken,
        {
          userId: request.user.id,
          role: request.user.role
        }
      )
    );
  }

  @Delete(':stickerId')
  @UseGuards(AdminGuard)
  public deleteSticker(
    @Req() request: AuthenticatedRequest,
    @Param('albumId') albumId: string | undefined,
    @Param('stickerId') stickerId: string | undefined
  ): Promise<void> {
    return this.stickersService.deleteSticker({
      accessToken: request.user.accessToken,
      actor: {
        userId: request.user.id,
        role: request.user.role
      },
      albumId: parseRequiredUuid(albumId, 'albumId'),
      stickerId: parseRequiredUuid(stickerId, 'stickerId')
    });
  }
}
