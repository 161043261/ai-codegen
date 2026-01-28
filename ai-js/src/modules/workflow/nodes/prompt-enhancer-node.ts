import { Injectable, Logger } from "@nestjs/common";
import { BaseWorkflowNode } from "./base-node";
import { WorkflowContext } from "../state/workflow-context";
import { AiCodeGeneratorService } from "../../ai/ai-code-generator.service";

/**
 * 提示增强节点
 * 增强用户的原始提示，添加更多细节和最佳实践
 */
@Injectable()
export class PromptEnhancerNode extends BaseWorkflowNode {
  readonly name = "prompt_enhancer";
  private readonly logger = new Logger(PromptEnhancerNode.name);

  constructor(private readonly aiService: AiCodeGeneratorService) {
    super();
  }

  async execute(context: WorkflowContext): Promise<WorkflowContext> {
    this.logger.log("开始执行提示增强节点");

    const updatedContext = this.updateStep(context, "增强提示词");

    try {
      const enhancedPrompt = await this.enhancePrompt(
        context.originalPrompt,
        context.collectedImages,
      );

      this.logger.log("提示词增强完成");

      return {
        ...updatedContext,
        enhancedPrompt,
      };
    } catch (error) {
      this.logger.error(`提示词增强失败: ${(error as Error).message}`);
      return {
        ...updatedContext,
        enhancedPrompt: context.originalPrompt,
      };
    }
  }

  /**
   * 增强提示词
   */
  private async enhancePrompt(
    originalPrompt: string,
    images?: Array<{ url: string; description: string }>,
  ): Promise<string> {
    const enhanceRequest = `你是一个专业的前端开发需求分析师。请根据以下用户需求，生成一个更详细、更专业的需求描述。

原始需求：${originalPrompt}

${images && images.length > 0 ? `可用的图片资源：\n${images.map((img) => `- ${img.description}: ${img.url}`).join("\n")}` : ""}

请补充以下内容：
1. 具体的页面结构和布局建议
2. 配色方案和视觉风格建议
3. 交互效果建议
4. 响应式设计要求

直接输出增强后的需求描述，不要其他解释。`;

    try {
      const response = await this.aiService.generateCode(
        enhanceRequest,
        "html",
        [],
      );
      return response.trim() || originalPrompt;
    } catch (error) {
      this.logger.warn(`增强提示词失败: ${(error as Error).message}`);
      return originalPrompt;
    }
  }
}
