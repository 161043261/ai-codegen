import { Injectable, Logger } from "@nestjs/common";
import { BaseTool } from "./base.tool";
import { FileReadTool } from "./file-read.tool";
import { FileWriteTool } from "./file-write.tool";
import { FileModifyTool } from "./file-modify.tool";
import { FileDeleteTool } from "./file-delete.tool";
import { FileDirReadTool } from "./file-dir-read.tool";
import { ExitTool } from "./exit.tool";

/**
 * 工具管理器
 * 管理所有可用的 AI 工具
 */
@Injectable()
export class ToolManager {
  private readonly logger = new Logger(ToolManager.name);
  private tools: Map<string, BaseTool> = new Map();

  /**
   * 为指定项目创建工具集
   * @param projectRoot 项目根目录
   */
  createToolsForProject(projectRoot: string): void {
    this.tools.clear();

    const fileReadTool = new FileReadTool(projectRoot);
    const fileWriteTool = new FileWriteTool(projectRoot);
    const fileModifyTool = new FileModifyTool(projectRoot);
    const fileDeleteTool = new FileDeleteTool(projectRoot);
    const fileDirReadTool = new FileDirReadTool(projectRoot);
    const exitTool = new ExitTool();

    this.registerTool(fileReadTool);
    this.registerTool(fileWriteTool);
    this.registerTool(fileModifyTool);
    this.registerTool(fileDeleteTool);
    this.registerTool(fileDirReadTool);
    this.registerTool(exitTool);

    this.logger.log(`已为项目 ${projectRoot} 创建 ${this.tools.size} 个工具`);
  }

  /**
   * 注册工具
   */
  registerTool(tool: BaseTool): void {
    this.tools.set(tool.getToolName(), tool);
  }

  /**
   * 获取工具
   */
  getTool<T extends BaseTool>(name: string): T | undefined {
    return this.tools.get(name) as T | undefined;
  }

  /**
   * 获取所有工具
   */
  getAllTools(): BaseTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * 获取所有工具定义（用于 LLM function calling）
   */
  getToolDefinitions(): Array<{
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  }> {
    return this.getAllTools().map((tool) => {
      if (
        "getToolDefinition" in tool &&
        typeof tool.getToolDefinition === "function"
      ) {
        return (
          tool as BaseTool & {
            getToolDefinition: () => {
              type: "function";
              function: {
                name: string;
                description: string;
                parameters: Record<string, unknown>;
              };
            };
          }
        ).getToolDefinition();
      }
      // 默认工具定义
      return {
        type: "function" as const,
        function: {
          name: tool.getToolName(),
          description: tool.getDescription(),
          parameters: { type: "object", properties: {} },
        },
      };
    });
  }

  /**
   * 执行工具调用
   * @param toolName 工具名称
   * @param args 工具参数
   * @returns 执行结果
   */
  executeTool(toolName: string, args: Record<string, unknown>): unknown {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return `错误：工具不存在 - ${toolName}`;
    }

    this.logger.log(`执行工具: ${tool.getDisplayName()}`);

    // 根据工具类型调用对应的 execute 方法
    switch (toolName) {
      case "readFile":
        return (tool as FileReadTool).execute(args.filePath as string);
      case "writeFile":
        return (tool as FileWriteTool).execute(
          args.filePath as string,
          args.content as string,
        );
      case "modifyFile":
        return (tool as FileModifyTool).execute(
          args.filePath as string,
          args.operation as
            | "replace"
            | "insertAfter"
            | "insertBefore"
            | "deleteLine",
          args.target as string,
          args.content as string,
        );
      case "deleteFile":
        return (tool as FileDeleteTool).execute(
          args.filePath as string,
          args.recursive as boolean,
        );
      case "readDir":
        return (tool as FileDirReadTool).execute(
          args.dirPath as string,
          args.maxDepth as number,
        );
      case "exit":
        return (tool as ExitTool).execute(args.summary as string);
      default:
        return `错误：未知的工具 - ${toolName}`;
    }
  }
}
