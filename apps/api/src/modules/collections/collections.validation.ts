import {
  BadRequestException,
  UnprocessableEntityException
} from '@nestjs/common';

import {
  normalizeCatalogCode,
  parsePageQuery,
  parseRequiredUuid
} from '../albums/albums.validation.js';
import type {
  CollectionPageQuery,
  SearchCollectionInput,
  SetStickerQuantityInput
} from './collections.types.js';

interface AuthenticatedInput {
  readonly userId: string;
  readonly accessToken: string;
}

const assertRecord = (body: unknown): Record<string, unknown> => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('Request body must be a JSON object');
  }

  return body as Record<string, unknown>;
};

const getQueryStringField = (
  query: Record<string, unknown>,
  fieldName: string
): string | undefined => {
  const value = query[fieldName];

  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;
};

const throwValidationError = (errors: readonly string[]): never => {
  throw new UnprocessableEntityException({
    message: 'Validation failed',
    errors
  });
};

export const parseSetStickerQuantityInput = (
  body: unknown,
  stickerId: string | undefined,
  authenticated: AuthenticatedInput
): SetStickerQuantityInput => {
  const record = assertRecord(body);
  const parsedStickerId = parseRequiredUuid(stickerId, 'stickerId');
  const quantityTotal = record.quantityTotal;
  const errors = [
    ...(Number.isInteger(quantityTotal) && Number(quantityTotal) >= 0
      ? []
      : ['quantityTotal must be a non-negative integer'])
  ];

  if (errors.length > 0) {
    throwValidationError(errors);
  }

  return {
    ...authenticated,
    stickerId: parsedStickerId,
    quantityTotal: Number(quantityTotal)
  };
};

export const parseSearchCollectionInput = (
  query: Record<string, unknown>,
  albumId: string | undefined,
  authenticated: AuthenticatedInput
): SearchCollectionInput => {
  const code = normalizeCatalogCode(getQueryStringField(query, 'code') ?? '');
  const errors = code.length > 0 ? [] : ['code is required'];

  if (errors.length > 0) {
    throwValidationError(errors);
  }

  return {
    ...authenticated,
    albumId: parseRequiredUuid(albumId, 'albumId'),
    code
  };
};

export const parseCollectionPageQuery = (
  query: Record<string, unknown>,
  albumId: string | undefined
): CollectionPageQuery => {
  const page = parsePageQuery(query);
  const sectionId = getQueryStringField(query, 'sectionId');

  if (sectionId) {
    parseRequiredUuid(sectionId, 'sectionId');
  }

  return {
    albumId: parseRequiredUuid(albumId, 'albumId'),
    ...(sectionId ? { sectionId } : {}),
    ...page
  };
};
