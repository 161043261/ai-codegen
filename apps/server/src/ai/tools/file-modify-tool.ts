import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

export class FileModifyTool extends StructuredTool {
  name = 'FileModify';
  description =
    'Modify a file by replacing a search string with a replacement string.';
  schema = z.object({
    filePath: z.string().describe('Relative file path'),
    searchStr: z.string().describe('String to search for'),
    replaceStr: z.string().describe('String to replace with'),
  });

  private readonly workDir: string;

  constructor(workDir: string) {
    super();
    this.workDir = workDir;
  }

  async _call(args: {
    filePath: string;
    searchStr: string;
    replaceStr: string;
  }): Promise<string> {
    try {
      const fullPath = resolve(this.workDir, args.filePath);
      if (!fullPath.startsWith(resolve(this.workDir))) {
        return 'Path traversal not allowed';
      }
      if (!existsSync(fullPath)) {
        return `File not found: ${args.filePath}`;
      }
      let content = await readFile(fullPath, 'utf-8');
      if (!content.includes(args.searchStr)) {
        return `Search string not found in file: ${args.filePath}`;
      }
      content = content.replace(args.searchStr, args.replaceStr);
      await writeFile(fullPath, content, 'utf-8');
      return `File modified: ${args.filePath}`;
    } catch (err) {
      return `Failed to modify file: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
}
