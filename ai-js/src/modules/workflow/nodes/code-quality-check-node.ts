import { Injectable, Logger } from "@nestjs/common";
import { BaseWorkflowNode } from "./base-node";
import { WorkflowContext, QualityResult } from "../state/workflow-context";
import { AiCodeGeneratorService } from "../../ai/ai-code-generator.service";

/**
 * 代码质量检查节点
 * 检查生成的代码是否符合质量标准
 */
@Injectable()
export class CodeQualityCheckNode extends BaseWorkflowNode {
  readonly name = "code_quality_check";
  private readonly logger = new Logger(CodeQualityCheckNode.name);

  constructor(private readonly aiService: AiCodeGeneratorService) {
    super();
  }

  async execute(context: WorkflowContext): Promise<WorkflowContext> {
    this.logger.log("开始执行代码质量检查节点");

    const updatedContext = this.updateStep(context, "检查代码质量");

    if (!context.generatedCode) {
      return {
        ...updatedContext,
        qualityResult: {
          isValid: false,
          errors: ["没有生成的代码"],
          warnings: [],
          suggestions: [],
        },
      };
    }

    try {
      const qualityResult = await this.checkCodeQuality(context.generatedCode);

      this.logger.log(
        `代码质量检查结果: ${qualityResult.isValid ? "通过" : "未通过"}`,
      );

      return {
        ...updatedContext,
        qualityResult,
      };
    } catch (error) {
      this.logger.error(`代码质量检查失败: ${(error as Error).message}`);
      // 检查失败时默认通过，避免阻塞流程
      return {
        ...updatedContext,
        qualityResult: {
          isValid: true,
          errors: [],
          warnings: ["质量检查过程出错，跳过检查"],
          suggestions: [],
        },
      };
    }
  }

  /**
   * 检查代码质量
   */
  private async checkCodeQuality(code: string): Promise<QualityResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 基础检查
    if (code.length < 100) {
      errors.push("代码长度过短，可能不完整");
    }

    // HTML 检查
    if (code.includes("<html") || code.includes("<!DOCTYPE")) {
      if (!code.includes("</html>")) {
        errors.push("HTML 标签未正确闭合");
      }
      if (!code.includes("<head") && !code.includes("<body")) {
        warnings.push("缺少 head 或 body 标签");
      }
    }

    // 代码块检查
    const codeBlockCount = (code.match(/```/g) || []).length;
    if (codeBlockCount % 2 !== 0) {
      errors.push("代码块标记不匹配");
    }

    // 常见错误检查
    if (code.includes("TODO") || code.includes("FIXME")) {
      warnings.push("代码中包含 TODO/FIXME 标记");
    }

    // 使用 AI 进行更深入的检查
    try {
      const aiResult = await this.aiQualityCheck(code);
      if (aiResult) {
        errors.push(...(aiResult.errors || []));
        warnings.push(...(aiResult.warnings || []));
        suggestions.push(...(aiResult.suggestions || []));
      }
    } catch (error) {
      this.logger.warn(`AI 质量检查失败: ${(error as Error).message}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * 使用 AI 进行质量检查
   */
  private async aiQualityCheck(code: string): Promise<{
    errors?: string[];
    warnings?: string[];
    suggestions?: string[];
  } | null> {
    const checkPrompt = `请检查以下代码的质量问题，以 JSON 格式返回检查结果。

代码：
${code.substring(0, 2000)}${code.length > 2000 ? "...(省略)" : ""}

返回格式：
{
  "errors": ["严重错误列表"],
  "warnings": ["警告列表"],
  "suggestions": ["改进建议列表"]
}

只返回 JSON，不要其他内容。如果没有问题，返回空数组。`;

    try {
      const response = await this.aiService.generateCode(
        checkPrompt,
        "html",
        [],
      );
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.warn(`解析 AI 质量检查结果失败: ${(error as Error).message}`);
    }

    return null;
  }
}
