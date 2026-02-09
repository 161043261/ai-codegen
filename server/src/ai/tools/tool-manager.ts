import { FileWriteTool } from './file-write.tool';
import { FileReadTool } from './file-read.tool';
import { FileModifyTool } from './file-modify.tool';
import { FileDeleteTool } from './file-delete.tool';
import { DirReadTool } from './dir-read.tool';
import { ExitTool } from './exit.tool';

export class ToolManager {
  static createTools(workDir: string) {
    const fileWrite = new FileWriteTool(workDir);
    const fileRead = new FileReadTool(workDir);
    const fileModify = new FileModifyTool(workDir);
    const fileDelete = new FileDeleteTool(workDir);
    const dirRead = new DirReadTool(workDir);
    const exitTool = new ExitTool(workDir);

    return [
      fileWrite.toLangChainTool(),
      fileRead.toLangChainTool(),
      fileModify.toLangChainTool(),
      fileDelete.toLangChainTool(),
      dirRead.toLangChainTool(),
      exitTool.toLangChainTool(),
    ];
  }
}
