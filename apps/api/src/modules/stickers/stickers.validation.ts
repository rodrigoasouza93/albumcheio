import {
  BadRequestException,
  UnprocessableEntityException
} from '@nestjs/common';

import {
  normalizeCatalogCode,
  parsePageQuery,
  parseRequiredUuid
} from '../albums/albums.validation.js';
import type { CreateStickerInput, StickerFilter } from './stickers.types.js';

const assertRecord = (body: unknown): Record<string, unknown> => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('Request body must be a JSON object');
  }

  return body as Record<string, unknown>;
};

const getOptionalStringField = (
  body: Record<string, unknown>,
  fieldName: string
): string | null => {
  const value = body[fieldName];

  if (value === undefined || value === null) {
    return null;
  }

  return typeof value === 'string' ? value.trim() : '';
};

const getRequiredStringField = (
  body: Record<string, unknown>,
  fieldName: string
): string => getOptionalStringField(body, fieldName) ?? '';

const getNumberField = (
  body: Record<string, unknown>,
  fieldName: string,
  defaultValue: number
): number => {
  const value = body[fieldName];

  if (value === undefined || value === null) {
    return defaultValue;
  }

  return typeof value === 'number' ? value : Number.NaN;
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

export const parseCreateStickerInput = (
  body: unknown,
  albumId: string,
  accessToken: string
): CreateStickerInput => {
  const record = assertRecord(body);
  const sectionId = getRequiredStringField(record, 'sectionId');
  const code = normalizeCatalogCode(getRequiredStringField(record, 'code'));
  const rawNumber = record.number;
  const number =
    rawNumber === undefined || rawNumber === null
      ? null
      : typeof rawNumber === 'number'
        ? rawNumber
        : Number.NaN;
  const title = getOptionalStringField(record, 'title');
  const sortOrder = getNumberField(record, 'sortOrder', 0);
  const errors = [
    ...(sectionId.length > 0 ? [] : ['sectionId is required']),
    ...(sectionId.length > 0 && !isUuid(sectionId)
      ? ['sectionId must be a valid UUID']
      : []),
    ...(code.length > 0 ? [] : ['code is required']),
    ...(number === null || (Number.isInteger(number) && number > 0)
      ? []
      : ['number must be a positive integer']),
    ...(title === '' ? ['title must not be blank'] : []),
    ...(Number.isInteger(sortOrder) && sortOrder >= 0
      ? []
      : ['sortOrder must be a non-negative integer'])
  ];

  if (errors.length > 0) {
    throwValidationError(errors);
  }

  return {
    accessToken,
    albumId,
    sectionId,
    code,
    number,
    title,
    sortOrder
  };
};

export const parseStickerFilter = (
  query: Record<string, unknown>,
  albumId: string
): StickerFilter => {
  const page = parsePageQuery(query);
  const sectionId = getQueryStringField(query, 'sectionId');
  const code = getQueryStringField(query, 'code');

  if (sectionId && !isUuid(sectionId)) {
    throwValidationError(['sectionId must be a valid UUID']);
  }

  return {
    albumId,
    ...(sectionId ? { sectionId } : {}),
    ...(code ? { code: normalizeCatalogCode(code) } : {}),
    ...page
  };
};

const isUuid = (value: string): boolean => {
  try {
    parseRequiredUuid(value, 'value');
    return true;
  } catch {
    return false;
  }
};
