import { Injectable, Logger } from '@nestjs/common';
import { AiCodegenService } from '../services/ai-codegen.service';
import { PromptSafeInputGuardrail } from '../guardrails/prompt-safe-input';
import { CodeParser } from './code-parser';
import { CodeSaver } from './code-saver';
import { CodegenType } from '../../common/enums/codegen-type';

@Injectable()
export class AiCodegenFacade {
  private readonly logger = new Logger(AiCodegenFacade.name);

  constructor(
    private readonly aiCodegenService: AiCodegenService,
    private readonly guardrail: PromptSafeInputGuardrail,
  ) {}

  async generateAndSaveCodeStream(
    appId: string,
    message: string,
    codegenType: CodegenType,
    onChunk: (chunk: string) => void,
  ): Promise<void> {
    this.guardrail.validate(message);

    const collectedContent: string[] = [];

    await this.aiCodegenService.generateStream(
      appId,
      message,
      codegenType,
      (chunk: string) => {
        collectedContent.push(chunk);
        onChunk(chunk);
      },
    );

    if (
      codegenType !== CodegenType.VITE_PROJECT &&
      collectedContent.length > 0
    ) {
      const fullContent = collectedContent.join('');
      const parsed = CodeParser.parse(fullContent, codegenType);
      if (parsed.files.length > 0) {
        CodeSaver.save(parsed, appId, codegenType);
      }
    }
  }
}
