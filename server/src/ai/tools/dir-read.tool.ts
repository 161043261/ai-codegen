import * as fs from 'fs';
import * as path from 'path';
import { BaseTool, ToolResult } from './base-tool';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export class DirReadTool extends BaseTool {
  name = 'ReadDir';
  description = 'Read the directory structure recursively.';

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

  async execute(params: { dirPath?: string }): Promise<ToolResult> {
    try {
      const targetDir = params.dirPath
        ? path.resolve(this.workDir, params.dirPath)
        : this.workDir;

      if (!targetDir.startsWith(path.resolve(this.workDir))) {
        return { success: false, message: 'Path traversal not allowed' };
      }
      if (!fs.existsSync(targetDir)) {
        return {
          success: false,
          message: `Directory not found: ${params.dirPath || '.'}`,
        };
      }

      const tree = this.buildTree(targetDir, '', 0, 5);
      return { success: true, message: tree };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to read directory: ${error.message}`,
      };
    }
  }

  private buildTree(
    dir: string,
    prefix: string,
    depth: number,
    maxDepth: number,
  ): string {
    if (depth >= maxDepth) return '';

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let result = '';

    for (const entry of entries) {
      if (this.ignoreDirs.includes(entry.name)) continue;
      if (entry.name.startsWith('.')) continue;

      result += `${prefix}${entry.name}${entry.isDirectory() ? '/' : ''}\n`;

      if (entry.isDirectory()) {
        result += this.buildTree(
          path.join(dir, entry.name),
          prefix + '  ',
          depth + 1,
          maxDepth,
        );
      }
    }

    return result;
  }

  toLangChainTool() {
    return tool(
      async (input: { dirPath?: string }) => {
        const result = await this.execute(input);
        return result.message;
      },
      {
        name: this.name,
        description: this.description,
        schema: z.object({
          dirPath: z
            .string()
            .optional()
            .describe('Relative directory path (default: root)'),
        }),
      },
    );
  }
}
