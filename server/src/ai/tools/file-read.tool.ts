import * as fs from 'fs';
import * as path from 'path';
import { BaseTool, ToolResult } from './base-tool';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export class FileReadTool extends BaseTool {
  name = 'FileRead';
  description = 'Read content from a file at the specified path.';

  async execute(params: { filePath: string }): Promise<ToolResult> {
    try {
      const fullPath = path.resolve(this.workDir, params.filePath);
      if (!fullPath.startsWith(path.resolve(this.workDir))) {
        return { success: false, message: 'Path traversal not allowed' };
      }
      if (!fs.existsSync(fullPath)) {
        return {
          success: false,
          message: `File not found: ${params.filePath}`,
        };
      }
      const content = fs.readFileSync(fullPath, 'utf-8');
      return { success: true, message: content };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to read file: ${error.message}`,
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
          filePath: z.string().describe('Relative file path to read'),
        }),
      },
    );
  }
}
