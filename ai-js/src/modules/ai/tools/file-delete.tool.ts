import * as fs from "fs";
import * as path from "path";
import { BaseTool } from "./base.tool";

/**
 * 文件删除工具
 */
export class FileDeleteTool extends BaseTool {
  private projectRoot: string;

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;
  }

  getToolName(): string {
    return "deleteFile";
  }

  getDisplayName(): string {
    return "删除文件";
  }

  getDescription(): string {
    return "删除指定的文件或目录";
  }

  generateToolExecutedResult(args: Record<string, unknown>): string {
    const filePath = args.filePath as string;
    return `[工具调用] ${this.getDisplayName()} ${filePath}`;
  }

  /**
   * 删除文件或目录
   * @param relativeFilePath 相对文件路径
   * @param recursive 是否递归删除目录
   * @returns 执行结果
   */
  execute(relativeFilePath: string, recursive = false): string {
    try {
      let targetPath = relativeFilePath;
      if (!path.isAbsolute(relativeFilePath)) {
        targetPath = path.join(this.projectRoot, relativeFilePath);
      }

      if (!fs.existsSync(targetPath)) {
        return `错误：文件或目录不存在 - ${relativeFilePath}`;
      }

      const stats = fs.statSync(targetPath);
      if (stats.isDirectory()) {
        if (!recursive) {
          return `错误：${relativeFilePath} 是一个目录，需要设置 recursive=true 才能删除`;
        }
        fs.rmSync(targetPath, { recursive: true, force: true });
        return `目录删除成功: ${relativeFilePath}`;
      } else {
        fs.unlinkSync(targetPath);
        return `文件删除成功: ${relativeFilePath}`;
      }
    } catch (error) {
      const errorMessage = `删除失败: ${relativeFilePath}, 错误: ${(error as Error).message}`;
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
              description: "文件或目录的相对路径",
            },
            recursive: {
              type: "boolean",
              description: "是否递归删除目录（默认 false）",
            },
          },
          required: ["filePath"],
        },
      },
    };
  }
}
