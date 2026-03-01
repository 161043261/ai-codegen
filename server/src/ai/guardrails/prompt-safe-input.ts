import { Injectable, Logger } from '@nestjs/common';
import { BusinessException } from '../../common/exceptions/biz-exception';
import { ErrorCode } from '../../common/enums/error-code';

@Injectable()
export class PromptSafeInputGuardrail {
  private readonly logger = new Logger(PromptSafeInputGuardrail.name);

  private readonly MAX_INPUT_LENGTH = 1000;

  private readonly sensitiveWords = [
    'ignore above',
    'ignore previous',
    'disregard',
    'forget previous',
    'jailbreak',
    'bypass',
    'override instructions',
    '忽略以上指令',
    '忽略之前的指令',
    '越狱',
    '绕过',
    '覆盖指令',
  ];

  private readonly injectionPatterns = [
    /\{\{.*?\}\}/,
    /ignore all previous commands/i,
    /act as if you are/i,
    /pretend you are/i,
    /you are now/i,
    /new instructions/i,
    /system:\s/i,
    /\[INST\]/i,
    /\[\/INST\]/i,
    /<\|im_start\|>/i,
    /<\|im_end\|>/i,
  ];

  validate(input: string): void {
    if (!input || input.trim().length === 0) {
      throw new BusinessException(
        ErrorCode.PARAMS_ERROR,
        'Input cannot be empty',
      );
    }

    if (input.length > this.MAX_INPUT_LENGTH) {
      throw new BusinessException(
        ErrorCode.PARAMS_ERROR,
        `The input cannot exceed ${this.MAX_INPUT_LENGTH} characters.`,
      );
    }

    const lowerInput = input.toLowerCase();
    for (const word of this.sensitiveWords) {
      if (lowerInput.includes(word.toLowerCase())) {
        this.logger.warn(`Sensitive word detected: ${word}`);
        throw new BusinessException(
          ErrorCode.PARAMS_ERROR,
          'Sensitive word detected',
        );
      }
    }

    for (const pattern of this.injectionPatterns) {
      if (pattern.test(input)) {
        this.logger.warn(`Injection pattern detected: ${pattern}`);
        throw new BusinessException(
          ErrorCode.PARAMS_ERROR,
          'Injection pattern detected',
        );
      }
    }
  }
}
