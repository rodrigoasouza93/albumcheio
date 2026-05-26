import { describe, expect, it } from 'vitest';

import { StructuredLoggerService } from './structured-logger.service.js';

describe('StructuredLoggerService', () => {
  it('sanitizes sensitive fields recursively', () => {
    const logger = new StructuredLoggerService();

    const sanitized = logger.sanitize({
      email: 'user@example.com',
      password: 'secret-password',
      nested: {
        accessToken: 'access-token',
        authorization: 'Bearer access-token',
        safe: 'value'
      }
    });

    expect(sanitized).toEqual({
      email: 'user@example.com',
      password: '[REDACTED]',
      nested: {
        accessToken: '[REDACTED]',
        authorization: '[REDACTED]',
        safe: 'value'
      }
    });
  });
});
