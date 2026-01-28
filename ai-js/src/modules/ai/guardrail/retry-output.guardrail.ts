import { Injectable, Logger } from "@nestjs/common";
import {
  OutputGuardrail,
  GuardrailResult,
  success,
  fail,
} from "./guardrail.interface";

/**
 * 代码块正则表达式
 */
const CODE_BLOCK_PATTERN = /```[\w]*\n[\s\S]*?```/g;

/**
 * 输出重试护栏
 * 检查 AI 输出是否符合预期格式，如果不符合则建议重试
 */
@Injectable()
export class RetryOutputGuardrail implements OutputGuardrail {
  private readonly logger = new Logger(RetryOutputGuardrail.name);

  /**
   * 验证 AI 输出
   */
  validate(output: string): GuardrailResult {
    // 检查是否为空
    if (!output || output.trim().length === 0) {
      this.logger.warn("AI 输出为空");
      return fail("AI 输出为空，建议重试");
    }

    // 检查是否包含错误标记
    const errorPatterns = [
      /I cannot/i,
      /I'm sorry, but/i,
      /I apologize/i,
      /as an AI/i,
      /I don't have the ability/i,
      /抱歉，我无法/,
      /很抱歉/,
      /作为AI/,
    ];

    for (const pattern of errorPatterns) {
      if (pattern.test(output)) {
        this.logger.warn(`检测到 AI 拒绝响应: ${pattern}`);
        return fail("AI 拒绝处理请求，建议修改提示词后重试");
      }
    }

    return success();
  }

  /**
   * 验证代码输出
   * 检查输出是否包含有效的代码块
   */
  validateCodeOutput(output: string): GuardrailResult {
    const baseResult = this.validate(output);
    if (!baseResult.success) {
      return baseResult;
    }

    // 检查是否包含代码块
    const codeBlocks = output.match(CODE_BLOCK_PATTERN);
    if (!codeBlocks || codeBlocks.length === 0) {
      this.logger.warn("输出不包含代码块");
      return fail("输出不包含有效的代码块，建议重试");
    }

    // 检查代码块是否过短
    for (const block of codeBlocks) {
      const codeContent = block
        .replace(/```[\w]*\n?/g, "")
        .replace(/```$/g, "")
        .trim();
      if (codeContent.length < 10) {
        this.logger.warn("代码块内容过短");
        return fail("代码块内容过短，可能生成不完整");
      }
    }

    return success();
  }

  /**
   * 验证 HTML 输出
   */
  validateHtmlOutput(output: string): GuardrailResult {
    const baseResult = this.validateCodeOutput(output);
    if (!baseResult.success) {
      return baseResult;
    }

    // 检查是否包含 HTML 基本结构
    const hasHtmlTag = /<html[\s>]/i.test(output);
    const hasHeadTag = /<head[\s>]/i.test(output);
    const hasBodyTag = /<body[\s>]/i.test(output);
    const hasDoctype = /<!DOCTYPE\s+html>/i.test(output);

    if (!hasHtmlTag || !hasBodyTag) {
      this.logger.warn("HTML 输出缺少基本结构");
      return fail("HTML 输出缺少基本结构（html/body 标签）");
    }

    return success();
  }

  /**
   * 验证 Vue 输出
   */
  validateVueOutput(output: string): GuardrailResult {
    const baseResult = this.validateCodeOutput(output);
    if (!baseResult.success) {
      return baseResult;
    }

    // 检查是否包含 Vue SFC 基本结构
    const hasTemplate = /<template[\s>]/i.test(output);
    const hasScript = /<script[\s>]/i.test(output);

    if (!hasTemplate) {
      this.logger.warn("Vue 输出缺少 template 标签");
      return fail("Vue 组件缺少 template 标签");
    }

    return success();
  }
}
