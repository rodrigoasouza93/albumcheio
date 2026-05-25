import {
  BadRequestException,
  UnprocessableEntityException
} from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { parseLoginInput, parseRegisterUserInput } from './auth.validation.js';

describe('auth validation', () => {
  it('normalizes register input', () => {
    const input = parseRegisterUserInput({
      name: '  Rodrigo  ',
      email: '  RODRIGO@example.com ',
      password: '12345678'
    });

    expect(input).toEqual({
      name: 'Rodrigo',
      email: 'rodrigo@example.com',
      password: '12345678'
    });
  });

  it('rejects malformed request bodies', () => {
    expect(() => parseLoginInput(null)).toThrow(BadRequestException);
  });

  it('rejects invalid register fields with 422', () => {
    expect(() =>
      parseRegisterUserInput({
        name: '',
        email: 'invalid',
        password: 'short'
      })
    ).toThrow(UnprocessableEntityException);
  });
});
