import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve, basename } from 'path';
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

export class FileDeleteTool extends StructuredTool {
  name = 'FileDelete';
  description =
    'Delete a file at the specified path, some critical files are protected.';
  schema = z.object({
    filePath: z.string().describe('Relative file path to delete'),
  });

  private readonly workDir: string;
  private readonly protectedFiles = [
    'package.json',
    'vite.config.ts',
    'vite.config.js',
    'index.html',
    'tsconfig.json',
    'tsconfig.node.json',
  ];

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

      const fileName = basename(args.filePath);
      if (this.protectedFiles.includes(fileName)) {
        return `Cannot delete protected file: ${fileName}`;
      }

      if (!existsSync(fullPath)) {
        return `File not found: ${args.filePath}`;
      }

      await unlink(fullPath);
      return `File deleted: ${args.filePath}`;
    } catch (err) {
      return `Failed to delete file: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
}
