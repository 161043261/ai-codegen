/**
 * AI 工具基类
 * 所有 AI 工具都应继承此类
 */
export abstract class BaseTool {
  /**
   * 获取工具名称
   */
  abstract getToolName(): string;

  /**
   * 获取工具显示名称
   */
  abstract getDisplayName(): string;

  /**
   * 获取工具描述
   */
  abstract getDescription(): string;

  /**
   * 生成工具执行结果的展示信息
   */
  abstract generateToolExecutedResult(args: Record<string, unknown>): string;
}
