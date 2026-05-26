import { Module } from '@nestjs/common';
import type { MiddlewareConsumer, NestModule } from '@nestjs/common';

import { AlbumsModule } from './albums/albums.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CollectionsModule } from './collections/collections.module.js';
import { HealthModule } from './health/health.module.js';
import { ObservabilityModule } from './observability/observability.module.js';
import { RequestObservabilityMiddleware } from './observability/request-observability.middleware.js';
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
    CollectionsModule,
    HealthModule,
    ObservabilityModule
  ]
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestObservabilityMiddleware).forRoutes('*');
  }
}
