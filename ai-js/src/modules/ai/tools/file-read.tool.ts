import * as fs from "fs";
import * as path from "path";
import { BaseTool } from "./base.tool";

/**
 * 文件读取工具
 */
export class FileReadTool extends BaseTool {
  private projectRoot: string;

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;
  }

  getToolName(): string {
    return "readFile";
  }

  getDisplayName(): string {
    return "读取文件";
  }

  getDescription(): string {
    return "读取指定文件的内容，返回文件的完整内容";
  }

  generateToolExecutedResult(args: Record<string, unknown>): string {
    const filePath = args.filePath as string;
    return `[工具调用] ${this.getDisplayName()} ${filePath}`;
  }

  /**
   * 读取文件内容
   * @param relativeFilePath 相对文件路径
   * @returns 文件内容或错误信息
   */
  execute(relativeFilePath: string): string {
    try {
      let targetPath = relativeFilePath;
      if (!path.isAbsolute(relativeFilePath)) {
        targetPath = path.join(this.projectRoot, relativeFilePath);
      }

      if (!fs.existsSync(targetPath)) {
        return `错误：文件不存在 - ${relativeFilePath}`;
      }

      const stats = fs.statSync(targetPath);
      if (stats.isDirectory()) {
        return `错误：路径是一个目录，不是文件 - ${relativeFilePath}`;
      }

      const content = fs.readFileSync(targetPath, "utf-8");
      return content;
    } catch (error) {
      const errorMessage = `读取文件失败: ${relativeFilePath}, 错误: ${(error as Error).message}`;
      return errorMessage;
    }
  }

  /**
   * 获取工具定义（用于 LLM function calling）
   */
  getToolDefinition() {
    return {
      type: "function" as const,
      function: {
        name: this.getToolName(),
        description: this.getDescription(),
        parameters: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "文件的相对路径",
            },
          },
          required: ["filePath"],
        },
      },
    };
  }
}
