import {
  BadRequestException,
  UnprocessableEntityException
} from '@nestjs/common';

import type { LoginInput, RegisterUserInput } from './auth.types.js';

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const assertRecord = (body: unknown): Record<string, unknown> => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('Request body must be a JSON object');
  }

  return body as Record<string, unknown>;
};

const getStringField = (
  body: Record<string, unknown>,
  fieldName: string
): string => {
  const value = body[fieldName];

  return typeof value === 'string' ? value.trim() : '';
};

const throwValidationError = (errors: readonly string[]): never => {
  throw new UnprocessableEntityException({
    message: 'Validation failed',
    errors
  });
};

export const parseRegisterUserInput = (body: unknown): RegisterUserInput => {
  const record = assertRecord(body);
  const name = getStringField(record, 'name');
  const email = getStringField(record, 'email').toLowerCase();
  const password = getStringField(record, 'password');
  const errors = [
    ...(name.length > 0 ? [] : ['name is required']),
    ...(EMAIL_PATTERN.test(email) ? [] : ['email must be valid']),
    ...(password.length >= MIN_PASSWORD_LENGTH
      ? []
      : [`password must have at least ${MIN_PASSWORD_LENGTH} characters`])
  ];

  if (errors.length > 0) {
    throwValidationError(errors);
  }

  return {
    name,
    email,
    password
  };
};

export const parseLoginInput = (body: unknown): LoginInput => {
  const record = assertRecord(body);
  const email = getStringField(record, 'email').toLowerCase();
  const password = getStringField(record, 'password');
  const errors = [
    ...(EMAIL_PATTERN.test(email) ? [] : ['email must be valid']),
    ...(password.length > 0 ? [] : ['password is required'])
  ];

  if (errors.length > 0) {
    throwValidationError(errors);
  }

  return {
    email,
    password
  };
};
