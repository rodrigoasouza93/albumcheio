import { Injectable } from '@nestjs/common';

import { SupabaseClient } from './supabase-client.js';

interface SupabaseConfig {
  readonly url: string;
  readonly anonKey: string;
  readonly serviceRoleKey: string;
}

@Injectable()
export class SupabaseService {
  public createAuthClient(): SupabaseClient {
    const config = this.getConfig();

    return new SupabaseClient({
      baseUrl: config.url,
      apiKey: config.anonKey,
      authorizationToken: config.anonKey
    });
  }

  public createUserClient(accessToken: string): SupabaseClient {
    const config = this.getConfig();

    return new SupabaseClient({
      baseUrl: config.url,
      apiKey: config.anonKey,
      authorizationToken: accessToken
    });
  }

  public createAdminClient(): SupabaseClient {
    const config = this.getConfig();

    return new SupabaseClient({
      baseUrl: config.url,
      apiKey: config.serviceRoleKey,
      authorizationToken: config.serviceRoleKey
    });
  }

  private getConfig(): SupabaseConfig {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !anonKey || !serviceRoleKey) {
      throw new Error('Supabase environment variables are not configured');
    }

    return {
      url,
      anonKey,
      serviceRoleKey
    };
  }
}
