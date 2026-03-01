import { Injectable, Logger } from '@nestjs/common';
import { AiCodegenService } from '../../ai/services/ai-codegen.service';
import { CodegenType } from '../../common/enums/codegen-type';
import { WorkflowStateType } from '../models/workflow-context';

@Injectable()
export class CodegenNode {
  private readonly logger = new Logger(CodegenNode.name);

  constructor(private readonly aiCodegenService: AiCodegenService) {}

  async execute(state: WorkflowStateType): Promise<Partial<WorkflowStateType>> {
    this.logger.log('Executing CodegenNode');
    const codegenType = state.codegenType || CodegenType.VANILLA_HTML;
    const prompt = state.enhancedPrompt || state.userPrompt;
    const collectedContent: string[] = [];

    await this.aiCodegenService.generateStream(
      state.appId || 'workflow',
      prompt,
      codegenType,
      (chunk: string) => {
        collectedContent.push(chunk);
      },
    );

    return {
      generatedCode: collectedContent.join(''),
    };
  }
}
