import {
  BadRequestException,
  UnprocessableEntityException
} from '@nestjs/common';

import type {
  AlbumStatus,
  AlbumSectionKind,
  CreateAlbumInput,
  CreateAlbumSectionInput,
  PageQuery,
  UpdateAlbumInput,
  UpdateAlbumSectionInput,
  UpdateAlbumStatusInput
} from './albums.types.js';

const DEFAULT_PAGE_LIMIT = 20;
const MAX_PAGE_LIMIT = 100;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SECTION_KINDS = ['tournament', 'team', 'custom'] as const;
const ALBUM_STATUSES = ['draft', 'published', 'archived'] as const;

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

const hasField = (
  body: Record<string, unknown>,
  fieldName: string
): boolean => Object.prototype.hasOwnProperty.call(body, fieldName);

const throwValidationError = (errors: readonly string[]): never => {
  throw new UnprocessableEntityException({
    message: 'Validation failed',
    errors
  });
};

export const normalizeCatalogCode = (code: string): string =>
  code.trim().toUpperCase();

export const parseRequiredUuid = (
  value: string | undefined,
  fieldName: string
): string => {
  const uuid = value ?? '';

  if (!UUID_PATTERN.test(uuid)) {
    throwValidationError([`${fieldName} must be a valid UUID`]);
  }

  return uuid;
};

export const parsePageQuery = (
  query: Record<string, unknown>,
  defaultLimit = DEFAULT_PAGE_LIMIT
): PageQuery => {
  const limit = Number(query.limit ?? defaultLimit);
  const offset = Number(query.offset ?? 0);
  const errors = [
    ...(Number.isInteger(limit) && limit > 0 && limit <= MAX_PAGE_LIMIT
      ? []
      : [`limit must be an integer between 1 and ${MAX_PAGE_LIMIT}`]),
    ...(Number.isInteger(offset) && offset >= 0
      ? []
      : ['offset must be a non-negative integer'])
  ];

  if (errors.length > 0) {
    throwValidationError(errors);
  }

  return {
    limit,
    offset
  };
};

export const parseCreateAlbumInput = (
  body: unknown,
  authenticated: AuthenticatedInput
): CreateAlbumInput => {
  const record = assertRecord(body);
  const name = getRequiredStringField(record, 'name');
  const edition = getOptionalStringField(record, 'edition');
  const description = getOptionalStringField(record, 'description');
  const errors = [
    ...(name.length > 0 ? [] : ['name is required']),
    ...(edition === '' ? ['edition must not be blank'] : []),
    ...(description === '' ? ['description must not be blank'] : [])
  ];

  if (errors.length > 0) {
    throwValidationError(errors);
  }

  return {
    ...authenticated,
    name,
    edition,
    description
  };
};

export const parseUpdateAlbumInput = (
  body: unknown,
  albumId: string,
  accessToken: string
): UpdateAlbumInput => {
  const record = assertRecord(body);
  const hasName = hasField(record, 'name');
  const hasEdition = hasField(record, 'edition');
  const hasDescription = hasField(record, 'description');
  const name = getOptionalStringField(record, 'name');
  const edition = getOptionalStringField(record, 'edition');
  const description = getOptionalStringField(record, 'description');
  const errors = [
    ...(hasName && name === null ? ['name must not be null'] : []),
    ...(name === '' ? ['name must not be blank'] : []),
    ...(edition === '' ? ['edition must not be blank'] : []),
    ...(description === '' ? ['description must not be blank'] : [])
  ];
  const input = {
    accessToken,
    albumId,
    ...(hasName ? { name: name ?? '' } : {}),
    ...(hasEdition ? { edition } : {}),
    ...(hasDescription ? { description } : {})
  };

  if (Object.keys(input).length === 2) {
    errors.push('at least one album field must be provided');
  }

  if (errors.length > 0) {
    throwValidationError(errors);
  }

  return input;
};

export const parseUpdateAlbumStatusInput = (
  body: unknown,
  albumId: string,
  accessToken: string
): UpdateAlbumStatusInput => {
  const record = assertRecord(body);
  const status = getRequiredStringField(record, 'status') as AlbumStatus;

  if (!ALBUM_STATUSES.includes(status)) {
    throwValidationError(['status must be draft, published, or archived']);
  }

  return {
    accessToken,
    albumId,
    status
  };
};

export const parseCreateAlbumSectionInput = (
  body: unknown,
  albumId: string,
  accessToken: string
): CreateAlbumSectionInput => {
  const record = assertRecord(body);
  const name = getRequiredStringField(record, 'name');
  const code = normalizeCatalogCode(getRequiredStringField(record, 'code'));
  const kind = getRequiredStringField(record, 'kind') as AlbumSectionKind;
  const sortOrder = getNumberField(record, 'sortOrder', 0);
  const errors = [
    ...(name.length > 0 ? [] : ['name is required']),
    ...(code.length > 0 ? [] : ['code is required']),
    ...(SECTION_KINDS.includes(kind) ? [] : ['kind must be valid']),
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
    name,
    code,
    kind,
    sortOrder
  };
};

export const parseUpdateAlbumSectionInput = (
  body: unknown,
  albumId: string,
  sectionId: string,
  accessToken: string
): UpdateAlbumSectionInput => {
  const record = assertRecord(body);
  const name = getOptionalStringField(record, 'name');
  const rawCode = getOptionalStringField(record, 'code');
  const code = rawCode === null ? null : normalizeCatalogCode(rawCode);
  const rawKind = getOptionalStringField(record, 'kind');
  const kind = rawKind === null ? null : (rawKind as AlbumSectionKind);
  const hasSortOrder = record.sortOrder !== undefined && record.sortOrder !== null;
  const sortOrder = getNumberField(record, 'sortOrder', 0);
  const errors = [
    ...(name === '' ? ['name must not be blank'] : []),
    ...(code === '' ? ['code must not be blank'] : []),
    ...(kind !== null && !SECTION_KINDS.includes(kind)
      ? ['kind must be valid']
      : []),
    ...(hasSortOrder && !(Number.isInteger(sortOrder) && sortOrder >= 0)
      ? ['sortOrder must be a non-negative integer']
      : [])
  ];
  const input = {
    accessToken,
    albumId,
    sectionId,
    ...(name !== null ? { name } : {}),
    ...(code !== null ? { code } : {}),
    ...(kind !== null ? { kind } : {}),
    ...(hasSortOrder ? { sortOrder } : {})
  };

  if (Object.keys(input).length === 3) {
    errors.push('at least one section field must be provided');
  }

  if (errors.length > 0) {
    throwValidationError(errors);
  }

  return input;
};
