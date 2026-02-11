import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModelConfigService } from './services/ai-model-config.service';
import { AiRouteService } from './services/ai-route.service';
import { AiCodegenService } from './services/ai-codegen.service';
import { AiCodegenFacade } from './core/ai-codegen-facade';
import { PromptSafeInputGuardrail } from './guardrails/prompt-safe-input';
import { ChatHistoryModule } from '../chat-history/chat-history.module';

@Module({
  imports: [ConfigModule, ChatHistoryModule],
  providers: [
    AiModelConfigService,
    AiRouteService,
    AiCodegenService,
    AiCodegenFacade,
    PromptSafeInputGuardrail,
  ],
  exports: [
    AiCodegenFacade,
    AiRouteService,
    AiCodegenService,
    AiModelConfigService,
  ],
})
export class AiModule {}
