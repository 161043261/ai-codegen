import * as fs from 'fs';
import * as path from 'path';
import { BaseTool, ToolResult } from './base-tool';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export class FileModifyTool extends BaseTool {
  name = 'FileModify';
  description =
    'Modify a file by replacing a search string with a replacement string.';

  async execute(params: {
    filePath: string;
    searchStr: string;
    replaceStr: string;
  }): Promise<ToolResult> {
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
      let content = fs.readFileSync(fullPath, 'utf-8');
      if (!content.includes(params.searchStr)) {
        return {
          success: false,
          message: `Search string not found in file: ${params.filePath}`,
        };
      }
      content = content.replace(params.searchStr, params.replaceStr);
      fs.writeFileSync(fullPath, content, 'utf-8');
      return { success: true, message: `File modified: ${params.filePath}` };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to modify file: ${error.message}`,
      };
    }
  }

  toLangChainTool() {
    return tool(
      async (input: {
        filePath: string;
        searchStr: string;
        replaceStr: string;
      }) => {
        const result = await this.execute(input);
        return result.message;
      },
      {
        name: this.name,
        description: this.description,
        schema: z.object({
          filePath: z.string().describe('Relative file path'),
          searchStr: z.string().describe('String to search for'),
          replaceStr: z.string().describe('String to replace with'),
        }),
      },
    );
  }
}
