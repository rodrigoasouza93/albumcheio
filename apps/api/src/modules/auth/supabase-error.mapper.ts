import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException
} from '@nestjs/common';

import { SupabaseApiError } from '../supabase/supabase-api.error.js';

const getPublicMessage = (error: SupabaseApiError): string => {
  if (error.statusCode === 401) {
    return 'Authentication failed';
  }

  if (error.statusCode === 403) {
    return 'Access denied';
  }

  return error.message;
};

export const mapSupabaseError = (error: unknown): Error => {
  if (!(error instanceof SupabaseApiError)) {
    return error instanceof Error ? error : new BadGatewayException();
  }

  const message = getPublicMessage(error);

  if (error.statusCode === 400) {
    return new BadRequestException(message);
  }

  if (error.statusCode === 401) {
    return new UnauthorizedException(message);
  }

  if (error.statusCode === 403) {
    return new ForbiddenException(message);
  }

  if (error.statusCode === 404) {
    return new NotFoundException(message);
  }

  if (error.statusCode === 409) {
    return new ConflictException(message);
  }

  if (error.statusCode === 422) {
    return new UnprocessableEntityException(message);
  }

  return new BadGatewayException('Supabase request failed');
};
