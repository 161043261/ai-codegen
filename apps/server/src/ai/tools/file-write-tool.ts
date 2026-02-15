import { writeFile, mkdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

export class FileWriteTool extends StructuredTool {
  name = 'FileWrite';
  description =
    'Write content to a file at the specified path. Creates directories if needed.';
  schema = z.object({
    filePath: z.string().describe('Relative file path'),
    content: z.string().describe('File content to write'),
  });

  private readonly workDir: string;

  constructor(workDir: string) {
    super();
    this.workDir = workDir;
  }

  async _call(args: { filePath: string; content: string }): Promise<string> {
    try {
      const fullPath = resolve(this.workDir, args.filePath);
      if (!fullPath.startsWith(resolve(this.workDir))) {
        return 'Path traversal not allowed';
      }
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, args.content, 'utf-8');
      return `File written: ${args.filePath}`;
    } catch (err: unknown) {
      return `Failed to write file: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
}
