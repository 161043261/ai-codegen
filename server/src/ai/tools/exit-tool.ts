import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

export class ExitTool extends StructuredTool {
  name = 'Exit';
  description =
    'Call this tool when you have completed all tasks. Provide a summary of what was done.';
  schema = z.object({
    summary: z.string().describe('Summary of completed work'),
  });

  async _call(args: { summary: string }): Promise<string> {
    return await Promise.resolve(args.summary);
  }
}
