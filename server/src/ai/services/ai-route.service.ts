import { Injectable, Logger } from '@nestjs/common';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { AiModelConfigService } from './ai-model-config.service';
import { ROUTE_SYSTEM_PROMPT } from '../prompts';
import { CodegenType } from '../../common/enums/codegen-type';

@Injectable()
export class AiRouteService {
  private readonly logger = new Logger(AiRouteService.name);

  constructor(private readonly aiModelConfig: AiModelConfigService) {}

  async routeCodegenType(userPrompt: string): Promise<CodegenType> {
    try {
      const model = this.aiModelConfig.createRouteChatModel();
      const response = await model.invoke([
        new SystemMessage(ROUTE_SYSTEM_PROMPT),
        new HumanMessage(userPrompt),
      ]);

      const content =
        typeof response.content === 'string' ? response.content : '';
      const upperContent = content.toUpperCase().trim();
      if (upperContent.includes('VITE_PROJECT'))
        return CodegenType.VITE_PROJECT;
      if (
        upperContent.includes('MULTI_FILES') ||
        upperContent.includes('MULTIPLE_FILES')
      )
        return CodegenType.MULTI_FILES;
      return CodegenType.VANILLA_HTML;
    } catch (error) {
      this.logger.error(
        'Route codegen type failed, defaulting to VANILLA_HTML',
        error,
      );
      return CodegenType.VANILLA_HTML;
    }
  }
}
