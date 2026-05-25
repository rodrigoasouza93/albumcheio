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

import { parseRequiredUuid } from '../albums/albums.validation.js';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { StickersService } from './stickers.service.js';
import type { StickerPage, StickerSummary } from './stickers.types.js';
import {
  parseCreateStickerInput,
  parseStickerFilter
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
  public createSticker(
    @Req() request: AuthenticatedRequest,
    @Param('albumId') albumId: string | undefined,
    @Body() body: unknown
  ): Promise<StickerSummary> {
    return this.stickersService.createSticker(
      parseCreateStickerInput(
        body,
        parseRequiredUuid(albumId, 'albumId'),
        request.user.accessToken
      )
    );
  }
}
