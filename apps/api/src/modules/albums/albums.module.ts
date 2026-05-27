import { Module } from '@nestjs/common';

import { ObservabilityModule } from '../observability/observability.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { SupabaseModule } from '../supabase/supabase.module.js';
import { AlbumsController } from './albums.controller.js';
import { AlbumsService } from './albums.service.js';
import { AlbumsRepository } from './data/albums.repository.js';

@Module({
  imports: [SupabaseModule, ObservabilityModule, AuthModule],
  controllers: [AlbumsController],
  providers: [AlbumsService, AlbumsRepository],
  exports: [AlbumsService]
})
export class AlbumsModule {}
