import { StructuredTool } from '@langchain/core/tools';
import { Logger } from '@nestjs/common';
import { z } from 'zod';

export class ExitTool extends StructuredTool {
  name = 'Exit';
  description =
    'Call this tool when you have completed **ALL** tasks, provide a summary of what was done.';
  schema = z.object({
    summary: z.string().describe('Summary of completed work'),
  });
  private readonly logger = new Logger(ExitTool.name);

  async _call(args: { summary: string }): Promise<string> {
    this.logger.warn(`Summary: ${args.summary}`);
    return await Promise.resolve(args.summary);
  }
}
