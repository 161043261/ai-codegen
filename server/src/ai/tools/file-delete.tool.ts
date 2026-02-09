import * as fs from 'fs';
import * as path from 'path';
import { BaseTool, ToolResult } from './base-tool';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export class FileDeleteTool extends BaseTool {
  name = 'FileDelete';
  description =
    'Delete a file at the specified path. Some critical files are protected.';

  private readonly protectedFiles = [
    'package.json',
    'vite.config.ts',
    'vite.config.js',
    'index.html',
    'tsconfig.json',
    'tsconfig.node.json',
  ];

  async execute(params: { filePath: string }): Promise<ToolResult> {
    try {
      const fullPath = path.resolve(this.workDir, params.filePath);
      if (!fullPath.startsWith(path.resolve(this.workDir))) {
        return { success: false, message: 'Path traversal not allowed' };
      }

      const fileName = path.basename(params.filePath);
      if (this.protectedFiles.includes(fileName)) {
        return {
          success: false,
          message: `Cannot delete protected file: ${fileName}`,
        };
      }

      if (!fs.existsSync(fullPath)) {
        return {
          success: false,
          message: `File not found: ${params.filePath}`,
        };
      }

      fs.unlinkSync(fullPath);
      return { success: true, message: `File deleted: ${params.filePath}` };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to delete file: ${error.message}`,
      };
    }
  }

  toLangChainTool() {
    return tool(
      async (input: { filePath: string }) => {
        const result = await this.execute(input);
        return result.message;
      },
      {
        name: this.name,
        description: this.description,
        schema: z.object({
          filePath: z.string().describe('Relative file path to delete'),
        }),
      },
    );
  }
}
