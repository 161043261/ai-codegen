import { Injectable, Logger } from '@nestjs/common';
import { WorkflowStateType } from '../models/workflow-context';

@Injectable()
export class PromptEnhanceNode {
  private readonly logger = new Logger(PromptEnhanceNode.name);

  async execute(state: WorkflowStateType): Promise<Partial<WorkflowStateType>> {
    this.logger.log('Executing PromptEnhanceNode');
    return {
      enhancedPrompt: state.userPrompt,
    };
  }
}
