import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { AdminGuard } from './admin.guard.js';

const createContext = (request: unknown): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => request
    })
  }) as unknown as ExecutionContext;

describe('AdminGuard', () => {
  it('allows administrative users', () => {
    const guard = new AdminGuard();

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
    const guard = new AdminGuard();

    expect(() =>
      guard.canActivate(
        createContext({
          user: {
            role: 'user'
          }
        })
      )
    ).toThrow(ForbiddenException);
  });
});
