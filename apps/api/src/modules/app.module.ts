import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module.js';
import { HealthModule } from './health/health.module.js';
import { ProfilesModule } from './profiles/profiles.module.js';
import { SupabaseModule } from './supabase/supabase.module.js';

@Module({
  imports: [SupabaseModule, AuthModule, ProfilesModule, HealthModule]
})
export class AppModule {}
