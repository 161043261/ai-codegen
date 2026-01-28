import { Injectable, Logger } from "@nestjs/common";
import { BaseWorkflowNode } from "./base-node";
import {
  WorkflowContext,
  ImageCollectionPlan,
} from "../state/workflow-context";
import { AiCodeGeneratorService } from "../../ai/ai-code-generator.service";

/**
 * 图片收集计划节点
 * 根据用户提示分析需要收集的图片类型
 */
@Injectable()
export class ImageCollectorNode extends BaseWorkflowNode {
  readonly name = "image_collector";
  private readonly logger = new Logger(ImageCollectorNode.name);

  constructor(private readonly aiService: AiCodeGeneratorService) {
    super();
  }

  async execute(context: WorkflowContext): Promise<WorkflowContext> {
    this.logger.log("开始执行图片收集计划节点");

    const updatedContext = this.updateStep(context, "分析图片需求");

    try {
      // 使用 AI 分析需要的图片
      const plan = await this.analyzeImageNeeds(context.originalPrompt);

      this.logger.log(`图片收集计划: ${JSON.stringify(plan)}`);

      return {
        ...updatedContext,
        imageCollectionPlan: plan,
        collectedImages: [],
      };
    } catch (error) {
      this.logger.error(`分析图片需求失败: ${(error as Error).message}`);
      return {
        ...updatedContext,
        imageCollectionPlan: {
          needContentImages: false,
          needDiagrams: false,
          needIllustrations: false,
          needLogo: false,
          imageDescriptions: [],
        },
      };
    }
  }

  /**
   * 分析图片需求
   */
  private async analyzeImageNeeds(
    prompt: string,
  ): Promise<ImageCollectionPlan> {
    const analysisPrompt = `分析以下需求，判断需要什么类型的图片资源。
    
需求：${prompt}

请以 JSON 格式回复，包含以下字段：
- needContentImages: 是否需要内容图片（如产品图、背景图）
- needDiagrams: 是否需要图表（如流程图、架构图）
- needIllustrations: 是否需要插图（如装饰性插画）
- needLogo: 是否需要 Logo
- imageDescriptions: 需要的图片描述数组

只返回 JSON，不要其他内容。`;

    try {
      const response = await this.aiService.generateCode(
        analysisPrompt,
        "html",
        [],
      );

      // 尝试解析 JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.warn(`解析图片需求失败: ${(error as Error).message}`);
    }

    // 默认返回
    return {
      needContentImages: false,
      needDiagrams: false,
      needIllustrations: false,
      needLogo: false,
      imageDescriptions: [],
    };
  }
}
