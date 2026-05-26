import { afterEach, describe, expect, it } from 'vitest';

import { SupabaseService } from './supabase.service.js';

const originalEnv = { ...process.env };

describe('SupabaseService', () => {
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('accepts the public Supabase anon key as auth client fallback', () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    delete process.env.SUPABASE_ANON_KEY;

    expect(() => new SupabaseService().createAuthClient()).not.toThrow();
  });

  it('reports missing Supabase environment variables by name', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => new SupabaseService().createAuthClient()).toThrow(
      'Supabase environment variables are not configured: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY'
    );
  });
});
