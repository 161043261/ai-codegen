import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

export class FileReadTool extends StructuredTool {
  name = 'FileRead';
  description = 'Read content from a file at the specified path.';
  schema = z.object({
    filePath: z.string().describe('Relative file path to read'),
  });

  private readonly workDir: string;

  constructor(workDir: string) {
    super();
    this.workDir = workDir;
  }

  async _call(args: { filePath: string }): Promise<string> {
    try {
      const fullPath = resolve(this.workDir, args.filePath);
      if (!fullPath.startsWith(resolve(this.workDir))) {
        return 'Path traversal not allowed';
      }
      if (!existsSync(fullPath)) {
        return `File not found: ${args.filePath}`;
      }
      return await readFile(fullPath, 'utf-8');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      return `Failed to read file: ${msg}`;
    }
  }
}
