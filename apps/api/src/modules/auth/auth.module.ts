import { Module } from '@nestjs/common';

import { ObservabilityModule } from '../observability/observability.module.js';
import { ProfilesModule } from '../profiles/profiles.module.js';
import { SupabaseModule } from '../supabase/supabase.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AdminGuard } from './admin.guard.js';
import { SupabaseAuthGuard } from './supabase-auth.guard.js';

@Module({
  imports: [SupabaseModule, ProfilesModule, ObservabilityModule],
  controllers: [AuthController],
  providers: [AuthService, SupabaseAuthGuard, AdminGuard],
  exports: [AuthService, SupabaseAuthGuard, AdminGuard]
})
export class AuthModule {}
