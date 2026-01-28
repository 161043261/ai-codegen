import { Module } from "@nestjs/common";
import { AiCodeGeneratorService } from "./ai-code-generator.service";
import { ToolManager } from "./tools/tool-manager";
import { PromptSafetyInputGuardrail, RetryOutputGuardrail } from "./guardrail";

@Module({
  providers: [
    AiCodeGeneratorService,
    ToolManager,
    PromptSafetyInputGuardrail,
    RetryOutputGuardrail,
  ],
  exports: [
    AiCodeGeneratorService,
    ToolManager,
    PromptSafetyInputGuardrail,
    RetryOutputGuardrail,
  ],
})
export class AiModule {}
