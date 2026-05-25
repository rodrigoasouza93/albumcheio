import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  UnprocessableEntityException
} from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { SupabaseApiError } from '../supabase/supabase-api.error.js';
import { mapSupabaseError } from './supabase-error.mapper.js';

describe('mapSupabaseError', () => {
  it('maps authentication errors to safe 401 responses', () => {
    const error = mapSupabaseError(
      new SupabaseApiError(401, 'invalid token details')
    );

    expect(error).toBeInstanceOf(UnauthorizedException);
    expect(error.message).toBe('Authentication failed');
  });

  it('maps authorization errors to safe 403 responses', () => {
    const error = mapSupabaseError(new SupabaseApiError(403, 'rls denied'));

    expect(error).toBeInstanceOf(ForbiddenException);
    expect(error.message).toBe('Access denied');
  });

  it('maps validation status codes directly', () => {
    expect(mapSupabaseError(new SupabaseApiError(400, 'bad'))).toBeInstanceOf(
      BadRequestException
    );
    expect(
      mapSupabaseError(new SupabaseApiError(422, 'invalid'))
    ).toBeInstanceOf(UnprocessableEntityException);
  });
});
