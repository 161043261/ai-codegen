import { StructuredTool } from '@langchain/core/tools';
import { FileWriteTool } from './file-write-tool';
import { FileReadTool } from './file-read-tool';
import { FileModifyTool } from './file-modify-tool';
import { FileDeleteTool } from './file-delete-tool';
import { DirReadTool } from './dir-read-tool';
import { ExitTool } from './exit-tool';

export class ToolManager {
  static createTools(workDir: string): StructuredTool[] {
    return [
      new FileWriteTool(workDir),
      new FileReadTool(workDir),
      new FileModifyTool(workDir),
      new FileDeleteTool(workDir),
      new DirReadTool(workDir),
      new ExitTool(),
    ];
  }
}
