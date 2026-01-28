import { Injectable, Logger } from "@nestjs/common";
import {
  InputGuardrail,
  GuardrailResult,
  success,
  fatal,
} from "./guardrail.interface";

/**
 * 敏感词列表
 */
const SENSITIVE_WORDS = [
  "忽略之前的指令",
  "ignore previous instructions",
  "ignore above",
  "破解",
  "hack",
  "绕过",
  "bypass",
  "越狱",
  "jailbreak",
  "DAN",
  "developer mode",
  "开发者模式",
];

/**
 * 注入攻击模式
 */
const INJECTION_PATTERNS = [
  /ignore\s+(?:previous|above|all)\s+(?:instructions?|commands?|prompts?)/i,
  /(?:forget|disregard)\s+(?:everything|all)\s+(?:above|before)/i,
  /(?:pretend|act|behave)\s+(?:as|like)\s+(?:if|you\s+are)/i,
  /system\s*:\s*you\s+are/i,
  /new\s+(?:instructions?|commands?|prompts?)\s*:/i,
  /\[system\]/i,
  /\{\{.*\}\}/i, // 模板注入
  /<\|.*\|>/i, // 特殊标记注入
];

/**
 * 最大输入长度
 */
const MAX_INPUT_LENGTH = 5000;

/**
 * Prompt 安全审查护栏
 * 检测和阻止恶意输入、注入攻击、敏感内容
 */
@Injectable()
export class PromptSafetyInputGuardrail implements InputGuardrail {
  private readonly logger = new Logger(PromptSafetyInputGuardrail.name);

  /**
   * 验证用户输入
   */
  validate(input: string): GuardrailResult {
    // 检查输入长度
    if (input.length > MAX_INPUT_LENGTH) {
      this.logger.warn(`输入内容过长: ${input.length} 字符`);
      return fatal(`输入内容过长，请不要超过 ${MAX_INPUT_LENGTH} 字`);
    }

    // 检查是否为空
    if (!input || input.trim().length === 0) {
      return fatal("输入内容不能为空");
    }

    // 检查敏感词
    const lowerInput = input.toLowerCase();
    for (const sensitiveWord of SENSITIVE_WORDS) {
      if (lowerInput.includes(sensitiveWord.toLowerCase())) {
        this.logger.warn(`检测到敏感词: ${sensitiveWord}`);
        return fatal("输入包含不当内容，请修改后重试");
      }
    }

    // 检查注入攻击模式
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        this.logger.warn(`检测到注入攻击模式: ${pattern}`);
        return fatal("检测到恶意输入，请求被拒绝");
      }
    }

    // 检查特殊字符过多（可能是编码攻击）
    const specialCharCount = (input.match(/[^\w\s\u4e00-\u9fa5]/g) || [])
      .length;
    const specialCharRatio = specialCharCount / input.length;
    if (specialCharRatio > 0.5 && input.length > 100) {
      this.logger.warn(
        `特殊字符比例过高: ${(specialCharRatio * 100).toFixed(1)}%`,
      );
      return fatal("输入内容格式异常，请检查后重试");
    }

    return success();
  }
}
