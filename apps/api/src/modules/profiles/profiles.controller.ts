import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';

import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';
import type { AuthenticatedUser, UserProfile } from '../auth/auth.types.js';
import { ProfilesService } from './profiles.service.js';

interface AuthenticatedRequest {
  readonly user: AuthenticatedUser;
}

@Controller('me')
export class ProfilesController {
  public constructor(
    @Inject(ProfilesService)
    private readonly profilesService: ProfilesService
  ) {}

  @UseGuards(SupabaseAuthGuard)
  @Get()
  public async getAuthenticatedProfile(
    @Req() request: AuthenticatedRequest
  ): Promise<UserProfile> {
    const profile = await this.profilesService.getOrCreateProfile({
      userId: request.user.id,
      name:
        request.user.name ?? request.user.email?.split('@')[0] ?? 'Collector',
      accessToken: request.user.accessToken
    });

    return {
      ...profile,
      email: request.user.email
    };
  }
}
