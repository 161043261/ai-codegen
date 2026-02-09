export interface ToolResult {
  success: boolean;
  message: string;
}

export abstract class BaseTool {
  abstract name: string;
  abstract description: string;
  protected workDir: string;

  constructor(workDir: string) {
    this.workDir = workDir;
  }

  abstract execute(params: Record<string, any>): Promise<ToolResult>;
}
