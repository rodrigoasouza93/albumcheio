import {
  BadGatewayException,
  ForbiddenException,
  Inject,
  Injectable
} from '@nestjs/common';

import { ProfilesService } from '../profiles/profiles.service.js';
import { SupabaseService } from '../supabase/supabase.service.js';
import { MetricsService } from '../observability/metrics.service.js';
import type { SupabaseAuthPayload } from '../supabase/supabase.types.js';
import { mapSupabaseError } from './supabase-error.mapper.js';
import type {
  AuthSessionResponse,
  LoginInput,
  LogoutResponse,
  RegisterUserInput
} from './auth.types.js';

@Injectable()
export class AuthService {
  public constructor(
    @Inject(SupabaseService)
    private readonly supabaseService: SupabaseService,
    @Inject(ProfilesService)
    private readonly profilesService: ProfilesService,
    @Inject(MetricsService)
    private readonly metricsService: MetricsService
  ) {}

  public async register(
    input: RegisterUserInput
  ): Promise<AuthSessionResponse> {
    try {
      const payload = await this.supabaseService.createAuthClient().signUp({
        email: input.email,
        password: input.password,
        name: input.name
      });
      const session = this.requireSession(payload);
      const user = this.requireUser(payload);
      const profile = await this.profilesService.createProfile({
        userId: user.id,
        name: input.name,
        accessToken: session.access_token
      });

      return {
        user: {
          ...profile,
          email: user.email ?? input.email
        },
        session: {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresIn: session.expires_in,
          tokenType: session.token_type
        }
      };
    } catch (error) {
      this.metricsService.recordAuthFailure('register_failed');
      throw mapSupabaseError(error);
    }
  }

  public async login(input: LoginInput): Promise<AuthSessionResponse> {
    try {
      const payload = await this.supabaseService
        .createAuthClient()
        .signInWithPassword(input);
      const session = this.requireSession(payload);
      const user = this.requireUser(payload);
      const profile = await this.profilesService.getOrCreateProfile({
        userId: user.id,
        name: this.getProfileName(user, input.email),
        accessToken: session.access_token
      });

      return {
        user: {
          ...profile,
          email: user.email ?? input.email
        },
        session: {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresIn: session.expires_in,
          tokenType: session.token_type
        }
      };
    } catch (error) {
      this.metricsService.recordAuthFailure('login_failed');
      throw mapSupabaseError(error);
    }
  }

  public async logout(accessToken: string): Promise<LogoutResponse> {
    try {
      await this.supabaseService.createUserClient(accessToken).signOut();

      return {
        success: true
      };
    } catch (error) {
      throw mapSupabaseError(error);
    }
  }

  private requireSession(
    payload: SupabaseAuthPayload
  ): NonNullable<SupabaseAuthPayload['session']> {
    const session =
      payload.session ??
      (payload.access_token &&
      payload.refresh_token &&
      payload.expires_in &&
      payload.token_type
        ? {
            access_token: payload.access_token,
            refresh_token: payload.refresh_token,
            expires_in: payload.expires_in,
            token_type: payload.token_type
          }
        : null);

    if (!session) {
      throw new ForbiddenException('Email confirmation is required');
    }

    return session;
  }

  private requireUser(payload: SupabaseAuthPayload) {
    if (!payload.user) {
      throw new BadGatewayException('Supabase did not return a user');
    }

    return payload.user;
  }

  private getProfileName(
    user: NonNullable<SupabaseAuthPayload['user']>,
    email: string
  ): string {
    const metadataName = user.user_metadata?.name?.trim();

    if (metadataName) {
      return metadataName;
    }

    const emailName = (user.email ?? email).split('@')[0]?.trim();

    return emailName || 'Collector';
  }
}
