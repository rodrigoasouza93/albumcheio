import { Module } from '@nestjs/common';

import { SupabaseModule } from '../supabase/supabase.module.js';
import { AlbumsController } from './albums.controller.js';
import { AlbumsService } from './albums.service.js';
import { AlbumsRepository } from './data/albums.repository.js';

@Module({
  imports: [SupabaseModule],
  controllers: [AlbumsController],
  providers: [AlbumsService, AlbumsRepository],
  exports: [AlbumsService]
})
export class AlbumsModule {}
