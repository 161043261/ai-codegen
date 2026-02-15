import { Injectable, Logger } from '@nestjs/common';
import { AiRouteService } from '../../ai/services/ai-route.service';
import { WorkflowStateType } from '../models/workflow-context';

@Injectable()
export class RouterNode {
  private readonly logger = new Logger(RouterNode.name);

  constructor(private readonly aiRouteService: AiRouteService) {}

  async execute(state: WorkflowStateType): Promise<Partial<WorkflowStateType>> {
    this.logger.log('Executing router node');
    const codegenType = await this.aiRouteService.routeCodegenType(
      state.enhancedPrompt || state.userPrompt,
    );
    return { codegenType };
  }
}
