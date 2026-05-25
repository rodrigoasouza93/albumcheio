import { Module } from '@nestjs/common';

import { ProfilesModule } from '../profiles/profiles.module.js';
import { SupabaseModule } from '../supabase/supabase.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { SupabaseAuthGuard } from './supabase-auth.guard.js';

@Module({
  imports: [SupabaseModule, ProfilesModule],
  controllers: [AuthController],
  providers: [AuthService, SupabaseAuthGuard],
  exports: [AuthService, SupabaseAuthGuard]
})
export class AuthModule {}
