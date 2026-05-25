import { Module } from '@nestjs/common';

import { AlbumsModule } from './albums/albums.module.js';
import { AuthModule } from './auth/auth.module.js';
import { HealthModule } from './health/health.module.js';
import { ProfilesModule } from './profiles/profiles.module.js';
import { StickersModule } from './stickers/stickers.module.js';
import { SupabaseModule } from './supabase/supabase.module.js';

@Module({
  imports: [
    SupabaseModule,
    AuthModule,
    ProfilesModule,
    AlbumsModule,
    StickersModule,
    HealthModule
  ]
})
export class AppModule {}
