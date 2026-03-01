import { writeFile, mkdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { Logger } from '@nestjs/common';

export class FileWriteTool extends StructuredTool {
  name = 'FileWrite';
  description =
    'Write content to a file at the specified path, creates necessary directories.';
  schema = z.object({
    filepath: z.string().describe('Relative file path'),
    content: z.string().describe('File content to write'),
  });
  private readonly logger = new Logger(FileWriteTool.name);

  private readonly workDir: string;

  constructor(workDir: string) {
    super();
    this.workDir = workDir;
  }

  async _call(args: { filepath: string; content: string }): Promise<string> {
    try {
      const fullPath = resolve(this.workDir, args.filepath);
      if (!fullPath.startsWith(resolve(this.workDir))) {
        return 'Path traversal not allowed';
      }
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, args.content, 'utf-8');
      this.logger.log('File written', args.filepath);
      return `File written: ${args.filepath}`;
    } catch (err: unknown) {
      this.logger.error('Failed to write file', err);
      return `Failed to write file: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
}
