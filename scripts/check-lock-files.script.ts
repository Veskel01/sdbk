import { existsSync } from 'node:fs';
import { join } from 'node:path';

const ALLOWED_LOCK_FILE = 'bun.lock';

const FORBIDDEN_LOCK_FILES = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml'
] as const;

export function checkLockFiles(): string[] {
  const errors: string[] = [];
  const basePath = process.cwd();

  for (const lockFile of FORBIDDEN_LOCK_FILES) {
    if (existsSync(join(basePath, lockFile))) {
      errors.push(
        `Invalid occurrence of "${lockFile}" file. Please remove it and use only "${ALLOWED_LOCK_FILE}"`
      );
    }
  }

  return errors;
}

console.log('🔒🔒🔒 Validating lock files 🔒🔒🔒\n');

const invalid = checkLockFiles();

if (invalid.length > 0) {
  for (const error of invalid) {
    console.error(error);
  }

  process.exit(1);
}

console.log('Lock file is valid 👍');
process.exit(0);
