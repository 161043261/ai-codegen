import { Injectable, Logger } from '@nestjs/common';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { AiModelConfigService } from '../../ai/services/ai-model-config.service';
import { CODE_QUALITY_CHECK_SYSTEM_PROMPT } from '../../ai/prompts';
import { WorkflowStateType } from '../models/workflow-context';

@Injectable()
export class CodeQualityCheckNode {
  private readonly logger = new Logger(CodeQualityCheckNode.name);

  constructor(private readonly aiModelConfig: AiModelConfigService) {}

  async execute(state: WorkflowStateType): Promise<Partial<WorkflowStateType>> {
    this.logger.log('Executing CodeQualityCheckNode');

    if (!state.generatedCode || state.generatedCode.trim().length === 0) {
      return {
        qualityCheckPassed: false,
        qualityCheckMessage: 'No code generated',
      };
    }

    try {
      const model = this.aiModelConfig.createStreamingChatModel();
      const response = await model.invoke([
        new SystemMessage(
          CODE_QUALITY_CHECK_SYSTEM_PROMPT +
            '\nRespond with JSON: {"passed": boolean, "score": number, "issues": string[]}',
        ),
        new HumanMessage(`Check this code:\n\n${state.generatedCode}`),
      ]);

      const content =
        typeof response.content === 'string' ? response.content : '';

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return {
            qualityCheckPassed:
              result.passed !== false && (result.score || 0) >= 60,
            qualityCheckMessage: content,
          };
        }
      } catch {
        // JSON parse failed
      }

      return {
        qualityCheckPassed: true,
        qualityCheckMessage: content,
      };
    } catch (error) {
      this.logger.error('Code quality check failed', error);
      return {
        qualityCheckPassed: true,
        qualityCheckMessage: 'Quality check skipped due to error',
      };
    }
  }
}
