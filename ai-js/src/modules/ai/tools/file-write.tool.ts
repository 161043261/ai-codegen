import * as fs from "fs";
import * as path from "path";
import { BaseTool } from "./base.tool";

/**
 * 文件写入工具
 */
export class FileWriteTool extends BaseTool {
  private projectRoot: string;

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;
  }

  getToolName(): string {
    return "writeFile";
  }

  getDisplayName(): string {
    return "写入文件";
  }

  getDescription(): string {
    return "将内容写入指定文件，如果文件不存在则创建，如果存在则覆盖";
  }

  generateToolExecutedResult(args: Record<string, unknown>): string {
    const filePath = args.filePath as string;
    return `[工具调用] ${this.getDisplayName()} ${filePath}`;
  }

  /**
   * 写入文件
   * @param relativeFilePath 相对文件路径
   * @param content 文件内容
   * @returns 执行结果
   */
  execute(relativeFilePath: string, content: string): string {
    try {
      let targetPath = relativeFilePath;
      if (!path.isAbsolute(relativeFilePath)) {
        targetPath = path.join(this.projectRoot, relativeFilePath);
      }

      // 确保目录存在
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(targetPath, content, "utf-8");
      return `文件写入成功: ${relativeFilePath}`;
    } catch (error) {
      const errorMessage = `写入文件失败: ${relativeFilePath}, 错误: ${(error as Error).message}`;
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
            content: {
              type: "string",
              description: "要写入的文件内容",
            },
          },
          required: ["filePath", "content"],
        },
      },
    };
  }
}
