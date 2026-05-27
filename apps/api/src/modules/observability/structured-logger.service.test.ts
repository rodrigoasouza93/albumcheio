import { afterEach, describe, expect, it, vi } from 'vitest';

import { StructuredLoggerService } from './structured-logger.service.js';

describe('StructuredLoggerService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it('writes safe catalog events without request payloads', () => {
    let loggedLine: unknown;
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation((line) => {
      loggedLine = line;
    });
    const logger = new StructuredLoggerService();

    logger.logCatalogAdminMutation({
      userId: 'user-id',
      role: 'admin',
      resource: 'album',
      action: 'status',
      outcome: 'success',
      albumId: 'album-id'
    });

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(typeof loggedLine).toBe('string');
    expect(JSON.parse(loggedLine)).toMatchObject({
      level: 'info',
      event: 'catalog_admin_mutation',
      userId: 'user-id',
      role: 'admin',
      resource: 'album',
      action: 'status',
      outcome: 'success',
      albumId: 'album-id'
    });
    expect(loggedLine).not.toContain('access-token');
    expect(loggedLine).not.toContain('password');
  });
});
