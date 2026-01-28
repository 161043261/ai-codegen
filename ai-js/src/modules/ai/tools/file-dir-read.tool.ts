import * as fs from "fs";
import * as path from "path";
import { BaseTool } from "./base.tool";

/**
 * 需要忽略的文件和目录
 */
const IGNORED_NAMES = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".DS_Store",
  ".env",
  "target",
  ".mvn",
  ".idea",
  ".vscode",
  "coverage",
]);

/**
 * 需要忽略的文件扩展名
 */
const IGNORED_EXTENSIONS = new Set([".log", ".tmp", ".cache", ".lock"]);

/**
 * 目录读取工具
 */
export class FileDirReadTool extends BaseTool {
  private projectRoot: string;

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;
  }

  getToolName(): string {
    return "readDir";
  }

  getDisplayName(): string {
    return "读取目录";
  }

  getDescription(): string {
    return "读取目录结构，获取指定目录下的所有文件和子目录信息";
  }

  generateToolExecutedResult(args: Record<string, unknown>): string {
    const dirPath = (args.dirPath as string) || "根目录";
    return `[工具调用] ${this.getDisplayName()} ${dirPath}`;
  }

  /**
   * 判断是否应该忽略该文件或目录
   */
  private shouldIgnore(fileName: string): boolean {
    if (IGNORED_NAMES.has(fileName)) {
      return true;
    }
    for (const ext of IGNORED_EXTENSIONS) {
      if (fileName.endsWith(ext)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 递归读取目录结构
   */
  private readDirRecursive(
    dirPath: string,
    relativePath: string,
    depth: number,
    maxDepth: number,
  ): string[] {
    const result: string[] = [];

    if (depth > maxDepth) {
      return result;
    }

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      const sortedEntries = entries.sort((a, b) => {
        // 目录排在前面
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });

      for (const entry of sortedEntries) {
        if (this.shouldIgnore(entry.name)) {
          continue;
        }

        const indent = "  ".repeat(depth);
        const entryRelativePath = relativePath
          ? `${relativePath}/${entry.name}`
          : entry.name;

        if (entry.isDirectory()) {
          result.push(`${indent}📁 ${entry.name}/`);
          const subEntries = this.readDirRecursive(
            path.join(dirPath, entry.name),
            entryRelativePath,
            depth + 1,
            maxDepth,
          );
          result.push(...subEntries);
        } else {
          result.push(`${indent}📄 ${entry.name}`);
        }
      }
    } catch (error) {
      result.push(`  [错误: ${(error as Error).message}]`);
    }

    return result;
  }

  /**
   * 读取目录结构
   * @param relativeDirPath 相对目录路径（为空则读取整个项目结构）
   * @param maxDepth 最大递归深度（默认 5）
   * @returns 目录结构字符串
   */
  execute(relativeDirPath?: string, maxDepth = 5): string {
    try {
      let targetPath = this.projectRoot;
      if (relativeDirPath) {
        targetPath = path.isAbsolute(relativeDirPath)
          ? relativeDirPath
          : path.join(this.projectRoot, relativeDirPath);
      }

      if (!fs.existsSync(targetPath)) {
        return `错误：目录不存在 - ${relativeDirPath || "根目录"}`;
      }

      const stats = fs.statSync(targetPath);
      if (!stats.isDirectory()) {
        return `错误：路径不是一个目录 - ${relativeDirPath}`;
      }

      const structure = this.readDirRecursive(targetPath, "", 0, maxDepth);
      return `项目目录结构:\n${structure.join("\n")}`;
    } catch (error) {
      const errorMessage = `读取目录结构失败: ${relativeDirPath || "根目录"}, 错误: ${(error as Error).message}`;
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
            dirPath: {
              type: "string",
              description: "目录的相对路径，为空则读取整个项目结构",
            },
            maxDepth: {
              type: "number",
              description: "最大递归深度（默认 5）",
            },
          },
          required: [],
        },
      },
    };
  }
}
