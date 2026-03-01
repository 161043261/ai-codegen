import { accessSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

export function ensureDir(dirpath: string) {
  mkdirSync(dirpath, { recursive: true });
  const gitignorePath = join(dirpath, '.gitignore');
  try {
    accessSync(gitignorePath);
  } catch {
    writeFileSync(gitignorePath, '*', 'utf-8');
  }
}
