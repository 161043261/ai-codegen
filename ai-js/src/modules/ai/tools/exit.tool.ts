import { BaseTool } from "./base.tool";

/**
 * 退出工具
 * 用于在 Agent 循环中标记任务完成
 */
export class ExitTool extends BaseTool {
  getToolName(): string {
    return "exit";
  }

  getDisplayName(): string {
    return "退出";
  }

  getDescription(): string {
    return "当任务完成时调用此工具，结束当前对话并返回最终结果";
  }

  generateToolExecutedResult(args: Record<string, unknown>): string {
    const summary = (args.summary as string) || "任务完成";
    return `[工具调用] ${this.getDisplayName()} - ${summary}`;
  }

  /**
   * 执行退出
   * @param summary 任务完成摘要
   * @returns 退出标记
   */
  execute(summary: string): { exit: true; summary: string } {
    return {
      exit: true,
      summary: summary || "任务完成",
    };
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
            summary: {
              type: "string",
              description: "任务完成的摘要说明",
            },
          },
          required: ["summary"],
        },
      },
    };
  }
}
