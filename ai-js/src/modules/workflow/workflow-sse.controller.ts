import {
  Controller,
  Post,
  Body,
  Sse,
  MessageEvent,
  Logger,
} from "@nestjs/common";
import { Observable, map } from "rxjs";
import { CodeGenWorkflow } from "./code-gen-workflow";
import { CodeGenType } from "../../common/enums/code-gen-type.enum";

/**
 * 工作流执行请求
 */
interface WorkflowExecuteRequest {
  prompt: string;
  appId?: string;
  userId?: string;
  generationType?: CodeGenType;
}

/**
 * 工作流 SSE 控制器
 */
@Controller("workflow")
export class WorkflowSseController {
  private readonly logger = new Logger(WorkflowSseController.name);

  constructor(private readonly codeGenWorkflow: CodeGenWorkflow) {}

  /**
   * 执行工作流（SSE 流式返回）
   */
  @Post("execute/sse")
  @Sse()
  executeWorkflowSse(
    @Body() request: WorkflowExecuteRequest,
  ): Observable<MessageEvent> {
    this.logger.log(
      `开始执行工作流，提示: ${request.prompt.substring(0, 100)}...`,
    );

    return this.codeGenWorkflow
      .executeWorkflowWithStream(request.prompt, {
        appId: request.appId,
        userId: request.userId,
        generationType: request.generationType,
      })
      .pipe(
        map((event) => ({
          type: event.type,
          data: JSON.stringify(event),
        })),
      );
  }

  /**
   * 执行工作流（同步返回）
   */
  @Post("execute")
  async executeWorkflow(@Body() request: WorkflowExecuteRequest) {
    this.logger.log(
      `开始执行工作流，提示: ${request.prompt.substring(0, 100)}...`,
    );

    const result = await this.codeGenWorkflow.executeWorkflow(request.prompt, {
      appId: request.appId,
      userId: request.userId,
      generationType: request.generationType,
    });

    return {
      code: result.error ? 50000 : 0,
      message: result.error || "success",
      data: {
        outputPath: result.outputPath,
        generationType: result.generationType,
        qualityResult: result.qualityResult,
      },
    };
  }

  /**
   * 获取工作流图
   */
  @Post("graph")
  getWorkflowGraph() {
    return {
      code: 0,
      message: "success",
      data: {
        mermaid: this.codeGenWorkflow.getWorkflowGraph(),
      },
    };
  }
}
