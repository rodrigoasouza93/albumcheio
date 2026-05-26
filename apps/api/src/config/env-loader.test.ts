import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { loadApiEnv } from './env-loader.js';

const originalEnv = { ...process.env };

describe('loadApiEnv', () => {
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('loads API env values before workspace fallback values', () => {
    const tempDirectory = mkdtempSync(join(tmpdir(), 'albumcheio-env-'));
    const workspaceDirectory = join(tempDirectory, 'workspace');
    const apiDirectory = join(workspaceDirectory, 'apps', 'api');

    mkdirSync(apiDirectory, { recursive: true });
    writeFileSync(join(workspaceDirectory, '.env'), 'API_PORT=4000\nROOT_ONLY=yes\n');
    writeFileSync(join(apiDirectory, '.env'), 'API_PORT=3001\nAPI_ONLY=yes\n');

    loadApiEnv(apiDirectory);

    expect(process.env.API_PORT).toBe('3001');
    expect(process.env.API_ONLY).toBe('yes');
    expect(process.env.ROOT_ONLY).toBe('yes');

    rmSync(tempDirectory, { force: true, recursive: true });
  });
});
