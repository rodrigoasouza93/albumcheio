import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { AdminGuard } from './admin.guard.js';

const createContext = (request: unknown): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => request
    })
  }) as unknown as ExecutionContext;

const createGuard = () => {
  const recordCatalogAuthorizationDenial = vi.fn();
  const logCatalogAuthorizationDenial = vi.fn();

  return {
    guard: new AdminGuard(
      { recordCatalogAuthorizationDenial } as never,
      { logCatalogAuthorizationDenial } as never
    ),
    recordCatalogAuthorizationDenial,
    logCatalogAuthorizationDenial
  };
};

describe('AdminGuard', () => {
  it('allows administrative users', () => {
    const { guard } = createGuard();

    expect(
      guard.canActivate(
        createContext({
          user: {
            role: 'admin'
          }
        })
      )
    ).toBe(true);
  });

  it('rejects common users', () => {
    const {
      guard,
      recordCatalogAuthorizationDenial,
      logCatalogAuthorizationDenial
    } = createGuard();

    expect(() =>
      guard.canActivate(
        createContext({
          user: {
            id: 'user-id',
            role: 'user'
          }
        })
      )
    ).toThrow(ForbiddenException);
    expect(recordCatalogAuthorizationDenial).toHaveBeenCalledWith({
      resource: 'catalog',
      action: 'admin_access',
      role: 'user'
    });
    expect(logCatalogAuthorizationDenial).toHaveBeenCalledWith({
      userId: 'user-id',
      role: 'user',
      resource: 'catalog',
      action: 'admin_access',
      outcome: 'denied'
    });
  });
});
