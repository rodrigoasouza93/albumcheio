import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const currentDirectory = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@albumcheio/shared': resolve(
        currentDirectory,
        '../../packages/shared/src/index.ts'
      )
    },
    tsconfigPaths: true
  },
  test: {
    environment: 'node',
    globals: true
  }
});
