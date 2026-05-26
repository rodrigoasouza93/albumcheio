import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const parseEnvLine = (line: string): readonly [string, string] | null => {
  const trimmedLine = line.trim();

  if (!trimmedLine || trimmedLine.startsWith('#')) {
    return null;
  }

  const separatorIndex = trimmedLine.indexOf('=');

  if (separatorIndex <= 0) {
    return null;
  }

  const key = trimmedLine.slice(0, separatorIndex).trim();
  const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
  const value = rawValue.replace(/^(['"])(.*)\1$/, '$2');

  return [key, value];
};

const loadEnvFile = (filePath: string): void => {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, 'utf8');

  for (const line of content.split(/\r?\n/)) {
    const envEntry = parseEnvLine(line);

    if (!envEntry) {
      continue;
    }

    const [key, value] = envEntry;
    process.env[key] ??= value;
  }
};

export const loadApiEnv = (
  apiDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
): void => {
  const workspaceDirectory = resolve(apiDirectory, '../..');

  loadEnvFile(resolve(apiDirectory, '.env'));
  loadEnvFile(resolve(workspaceDirectory, '.env'));
};
