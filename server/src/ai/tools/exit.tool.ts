import { BaseTool, ToolResult } from './base-tool';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export class ExitTool extends BaseTool {
  name = 'Exit';
  description =
    'Call this tool when you have completed all tasks. Provide a summary of what was done.';

  async execute(params: { summary: string }): Promise<ToolResult> {
    return { success: true, message: params.summary };
  }

  toLangChainTool() {
    return tool(
      async (input: { summary: string }) => {
        const result = await this.execute(input);
        return result.message;
      },
      {
        name: this.name,
        description: this.description,
        schema: z.object({
          summary: z.string().describe('Summary of completed work'),
        }),
      },
    );
  }
}
