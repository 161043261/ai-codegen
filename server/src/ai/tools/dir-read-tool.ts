import { existsSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

export class DirReadTool extends StructuredTool {
  name = 'ReadDir';
  description = 'Read the directory structure recursively.';
  schema = z.object({
    dirPath: z
      .string()
      .optional()
      .describe('Relative directory path (default: root)'),
  });

  private readonly workDir: string;
  private readonly ignoreDirs = [
    'node_modules',
    '.git',
    'dist',
    '.next',
    '.nuxt',
    'build',
    '.cache',
    'coverage',
  ];

  constructor(workDir: string) {
    super();
    this.workDir = workDir;
  }

  async _call(args: { dirPath?: string }): Promise<string> {
    try {
      const targetDir = args.dirPath
        ? resolve(this.workDir, args.dirPath)
        : this.workDir;

      if (!targetDir.startsWith(resolve(this.workDir))) {
        return 'Path traversal not allowed';
      }
      if (!existsSync(targetDir)) {
        return `Directory not found: ${args.dirPath || '.'}`;
      }

      return await this.buildTree(targetDir, '', 0, 5);
    } catch (err) {
      return `Failed to read directory: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  private async buildTree(
    dir: string,
    prefix: string,
    depth: number,
    maxDepth: number,
  ): Promise<string> {
    if (depth >= maxDepth) return '';

    const entries = readdirSync(dir, { withFileTypes: true });
    let result = '';

    for (const entry of entries) {
      if (this.ignoreDirs.includes(entry.name)) continue;
      if (entry.name.startsWith('.')) continue;

      result += `${prefix}${entry.name}${entry.isDirectory() ? '/' : ''}\n`;

      if (entry.isDirectory()) {
        result += await this.buildTree(
          join(dir, entry.name),
          prefix + '  ',
          depth + 1,
          maxDepth,
        );
      }
    }

    return result;
  }
}
