import { Module } from '@nestjs/common';

import { SupabaseModule } from '../supabase/supabase.module.js';
import { StickersRepository } from './data/stickers.repository.js';
import { StickersController } from './stickers.controller.js';
import { StickersService } from './stickers.service.js';

@Module({
  imports: [SupabaseModule],
  controllers: [StickersController],
  providers: [StickersService, StickersRepository]
})
export class StickersModule {}
