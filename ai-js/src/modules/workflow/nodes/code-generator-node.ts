import { Injectable, Logger } from "@nestjs/common";
import { BaseWorkflowNode } from "./base-node";
import { WorkflowContext } from "../state/workflow-context";
import { AiCodeGeneratorService } from "../../ai/ai-code-generator.service";
import { CodeGenType } from "../../../common/enums/code-gen-type.enum";

/**
 * 代码生成节点
 * 调用 AI 生成代码
 */
@Injectable()
export class CodeGeneratorNode extends BaseWorkflowNode {
  readonly name = "code_generator";
  private readonly logger = new Logger(CodeGeneratorNode.name);

  constructor(private readonly aiService: AiCodeGeneratorService) {
    super();
  }

  async execute(context: WorkflowContext): Promise<WorkflowContext> {
    this.logger.log("开始执行代码生成节点");

    const updatedContext = this.updateStep(context, "生成代码");

    try {
      const prompt = context.enhancedPrompt || context.originalPrompt;
      const codeGenType = context.generationType || CodeGenType.HTML;

      // 构建完整提示
      let fullPrompt = prompt;
      if (context.collectedImages && context.collectedImages.length > 0) {
        fullPrompt += `\n\n可用的图片资源：\n${context.collectedImages.map((img) => `- ${img.description}: ${img.url}`).join("\n")}`;
      }

      // 生成代码
      const generatedCode = await this.aiService.generateCode(
        fullPrompt,
        codeGenType,
        [],
      );

      this.logger.log(`代码生成完成，长度: ${generatedCode.length}`);

      return {
        ...updatedContext,
        generatedCode,
      };
    } catch (error) {
      this.logger.error(`代码生成失败: ${(error as Error).message}`);
      return this.setError(updatedContext, (error as Error).message);
    }
  }
}
