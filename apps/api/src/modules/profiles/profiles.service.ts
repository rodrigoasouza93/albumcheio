import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service.js';
import type { SupabaseProfileRow } from '../supabase/supabase.types.js';
import { mapSupabaseError } from '../auth/supabase-error.mapper.js';
import type { UserProfile } from '../auth/auth.types.js';

interface ProfileLookupInput {
  readonly userId: string;
  readonly accessToken: string;
}

interface CreateProfileInput extends ProfileLookupInput {
  readonly name: string;
}

@Injectable()
export class ProfilesService {
  public constructor(
    @Inject(SupabaseService)
    private readonly supabaseService: SupabaseService
  ) {}

  public async createProfile(input: CreateProfileInput): Promise<UserProfile> {
    try {
      const profile = await this.supabaseService
        .createUserClient(input.accessToken)
        .insertProfile({
          id: input.userId,
          name: input.name
        });

      return this.mapProfile(profile);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  }

  public async getProfile(input: ProfileLookupInput): Promise<UserProfile> {
    try {
      const profile = await this.supabaseService
        .createUserClient(input.accessToken)
        .getProfile(input.userId);

      return this.mapProfile(profile);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  }

  public async getOrCreateProfile(
    input: CreateProfileInput
  ): Promise<UserProfile> {
    try {
      return await this.getProfile(input);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return this.createProfile(input);
      }

      throw error;
    }
  }

  private mapProfile(profile: SupabaseProfileRow): UserProfile {
    return {
      id: profile.id,
      name: profile.name,
      role: profile.role,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    };
  }
}
