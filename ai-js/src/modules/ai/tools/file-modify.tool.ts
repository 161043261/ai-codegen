import * as fs from "fs";
import * as path from "path";
import { BaseTool } from "./base.tool";

/**
 * 文件修改工具
 * 支持在文件指定位置插入、替换或删除内容
 */
export class FileModifyTool extends BaseTool {
  private projectRoot: string;

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;
  }

  getToolName(): string {
    return "modifyFile";
  }

  getDisplayName(): string {
    return "修改文件";
  }

  getDescription(): string {
    return "修改文件内容，支持替换指定文本、在指定行插入内容、删除指定行";
  }

  generateToolExecutedResult(args: Record<string, unknown>): string {
    const filePath = args.filePath as string;
    const operation = args.operation as string;
    return `[工具调用] ${this.getDisplayName()} ${filePath} (${operation})`;
  }

  /**
   * 修改文件
   * @param relativeFilePath 相对文件路径
   * @param operation 操作类型: replace | insertAfter | insertBefore | deleteLine
   * @param target 目标内容（用于定位）
   * @param content 新内容（replace/insert 时使用）
   * @returns 执行结果
   */
  execute(
    relativeFilePath: string,
    operation: "replace" | "insertAfter" | "insertBefore" | "deleteLine",
    target: string,
    content?: string,
  ): string {
    try {
      let targetPath = relativeFilePath;
      if (!path.isAbsolute(relativeFilePath)) {
        targetPath = path.join(this.projectRoot, relativeFilePath);
      }

      if (!fs.existsSync(targetPath)) {
        return `错误：文件不存在 - ${relativeFilePath}`;
      }

      let fileContent = fs.readFileSync(targetPath, "utf-8");

      switch (operation) {
        case "replace":
          if (!content) {
            return "错误：替换操作需要提供新内容";
          }
          if (!fileContent.includes(target)) {
            return `错误：未找到要替换的内容 - ${target}`;
          }
          fileContent = fileContent.replace(target, content);
          break;

        case "insertAfter":
          if (!content) {
            return "错误：插入操作需要提供新内容";
          }
          if (!fileContent.includes(target)) {
            return `错误：未找到目标位置 - ${target}`;
          }
          fileContent = fileContent.replace(target, target + "\n" + content);
          break;

        case "insertBefore":
          if (!content) {
            return "错误：插入操作需要提供新内容";
          }
          if (!fileContent.includes(target)) {
            return `错误：未找到目标位置 - ${target}`;
          }
          fileContent = fileContent.replace(target, content + "\n" + target);
          break;

        case "deleteLine":
          const lines = fileContent.split("\n");
          const lineIndex = lines.findIndex((line) => line.includes(target));
          if (lineIndex === -1) {
            return `错误：未找到要删除的行 - ${target}`;
          }
          lines.splice(lineIndex, 1);
          fileContent = lines.join("\n");
          break;

        default:
          return `错误：不支持的操作类型 - ${operation}`;
      }

      fs.writeFileSync(targetPath, fileContent, "utf-8");
      return `文件修改成功: ${relativeFilePath}`;
    } catch (error) {
      const errorMessage = `修改文件失败: ${relativeFilePath}, 错误: ${(error as Error).message}`;
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
            operation: {
              type: "string",
              enum: ["replace", "insertAfter", "insertBefore", "deleteLine"],
              description: "操作类型",
            },
            target: {
              type: "string",
              description: "目标内容，用于定位修改位置",
            },
            content: {
              type: "string",
              description: "新内容（replace/insert 操作时需要）",
            },
          },
          required: ["filePath", "operation", "target"],
        },
      },
    };
  }
}
