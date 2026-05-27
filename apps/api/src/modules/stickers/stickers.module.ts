import { Module } from '@nestjs/common';

import { ObservabilityModule } from '../observability/observability.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { SupabaseModule } from '../supabase/supabase.module.js';
import { StickersRepository } from './data/stickers.repository.js';
import { StickersController } from './stickers.controller.js';
import { StickersService } from './stickers.service.js';

@Module({
  imports: [SupabaseModule, ObservabilityModule, AuthModule],
  controllers: [StickersController],
  providers: [StickersService, StickersRepository]
})
export class StickersModule {}
