import { readFileSync } from 'fs';
import { join } from 'path';

export const VANILLA_HTML_SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), 'prompts/vanilla-html-system-prompt.md'),
  { encoding: 'utf-8' },
);

export const MULTI_FILES_SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), 'prompts/multi-files-system-prompt.md'),
  { encoding: 'utf-8' },
);

export const VITE_PROJECT_SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), 'prompts/vite-project-system-prompt.md'),
  { encoding: 'utf-8' },
);

export const ROUTE_SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), 'prompts/route-system-prompt.md'),
  { encoding: 'utf-8' },
);

export const CODE_QUALITY_CHECK_SYSTEM_PROMPT = `You are a frontend master, review the generated code.`;
