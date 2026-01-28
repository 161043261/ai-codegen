import { Injectable, Logger } from "@nestjs/common";
import { BaseWorkflowNode } from "./base-node";
import { WorkflowContext } from "../state/workflow-context";
import { CodeGenType } from "../../../common/enums/code-gen-type.enum";
import { AiCodeGeneratorService } from "../../ai/ai-code-generator.service";

/**
 * 路由节点
 * 根据需求自动选择最合适的代码生成类型
 */
@Injectable()
export class RouterNode extends BaseWorkflowNode {
  readonly name = "router";
  private readonly logger = new Logger(RouterNode.name);

  constructor(private readonly aiService: AiCodeGeneratorService) {
    super();
  }

  async execute(context: WorkflowContext): Promise<WorkflowContext> {
    this.logger.log("开始执行路由节点");

    const updatedContext = this.updateStep(context, "选择生成类型");

    // 如果已经指定了生成类型，直接使用
    if (context.generationType) {
      this.logger.log(`使用预设的生成类型: ${context.generationType}`);
      return updatedContext;
    }

    try {
      const generationType = await this.aiService.routeCodeGenType(
        context.enhancedPrompt || context.originalPrompt,
      );

      this.logger.log(`路由选择的生成类型: ${generationType}`);

      return {
        ...updatedContext,
        generationType,
      };
    } catch (error) {
      this.logger.error(`路由选择失败: ${(error as Error).message}`);
      return {
        ...updatedContext,
        generationType: CodeGenType.HTML,
      };
    }
  }
}
