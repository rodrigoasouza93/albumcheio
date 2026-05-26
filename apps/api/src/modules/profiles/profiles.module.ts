import { Module } from '@nestjs/common';

import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';
import { ObservabilityModule } from '../observability/observability.module.js';
import { SupabaseModule } from '../supabase/supabase.module.js';
import { ProfilesController } from './profiles.controller.js';
import { ProfilesService } from './profiles.service.js';

@Module({
  imports: [SupabaseModule, ObservabilityModule],
  controllers: [ProfilesController],
  providers: [ProfilesService, SupabaseAuthGuard],
  exports: [ProfilesService]
})
export class ProfilesModule {}
