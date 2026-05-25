import { Inject, Injectable } from '@nestjs/common';

import { SupabaseService } from '../../supabase/supabase.service.js';
import type { SupabaseStickerRow } from '../../supabase/supabase.types.js';
import type { CreateStickerInput, StickerFilter } from '../stickers.types.js';

@Injectable()
export class StickersRepository {
  public constructor(
    @Inject(SupabaseService)
    private readonly supabaseService: SupabaseService
  ) {}

  public createSticker(input: CreateStickerInput): Promise<SupabaseStickerRow> {
    return this.supabaseService
      .createUserClient(input.accessToken)
      .insertSticker(input);
  }

  public listStickers(
    accessToken: string,
    filter: StickerFilter
  ): Promise<readonly SupabaseStickerRow[]> {
    return this.supabaseService
      .createUserClient(accessToken)
      .listStickers(filter);
  }
}
