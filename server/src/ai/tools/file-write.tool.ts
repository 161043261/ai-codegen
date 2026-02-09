import * as fs from 'fs';
import * as path from 'path';
import { BaseTool, ToolResult } from './base-tool';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export class FileWriteTool extends BaseTool {
  name = 'FileWrite';
  description =
    'Write content to a file at the specified path. Creates directories if needed.';

  async execute(params: {
    filePath: string;
    content: string;
  }): Promise<ToolResult> {
    try {
      const fullPath = path.resolve(this.workDir, params.filePath);
      if (!fullPath.startsWith(path.resolve(this.workDir))) {
        return { success: false, message: 'Path traversal not allowed' };
      }
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, params.content, 'utf-8');
      return { success: true, message: `File written: ${params.filePath}` };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to write file: ${error.message}`,
      };
    }
  }

  toLangChainTool() {
    return tool(
      async (input: { filePath: string; content: string }) => {
        const result = await this.execute(input);
        return result.message;
      },
      {
        name: this.name,
        description: this.description,
        schema: z.object({
          filePath: z.string().describe('Relative file path'),
          content: z.string().describe('File content to write'),
        }),
      },
    );
  }
}
