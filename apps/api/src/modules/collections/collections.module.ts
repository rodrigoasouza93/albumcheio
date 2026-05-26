import { Module } from '@nestjs/common';

import { ObservabilityModule } from '../observability/observability.module.js';
import { SupabaseModule } from '../supabase/supabase.module.js';
import { CollectionsController } from './collections.controller.js';
import { CollectionsService } from './collections.service.js';
import { CollectionsRepository } from './data/collections.repository.js';

@Module({
  imports: [SupabaseModule, ObservabilityModule],
  controllers: [CollectionsController],
  providers: [CollectionsService, CollectionsRepository]
})
export class CollectionsModule {}
