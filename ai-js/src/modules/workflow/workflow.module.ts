import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { CoreModule } from "../core/core.module";
import { BuilderModule } from "../builder/builder.module";
import { CodeGenWorkflow } from "./code-gen-workflow";
import { WorkflowSseController } from "./workflow-sse.controller";
import { ImageCollectorNode } from "./nodes/image-collector-node";
import { PromptEnhancerNode } from "./nodes/prompt-enhancer-node";
import { RouterNode } from "./nodes/router-node";
import { CodeGeneratorNode } from "./nodes/code-generator-node";
import { CodeQualityCheckNode } from "./nodes/code-quality-check-node";
import { ProjectBuilderNode } from "./nodes/project-builder-node";

@Module({
  imports: [AiModule, CoreModule, BuilderModule],
  controllers: [WorkflowSseController],
  providers: [
    CodeGenWorkflow,
    ImageCollectorNode,
    PromptEnhancerNode,
    RouterNode,
    CodeGeneratorNode,
    CodeQualityCheckNode,
    ProjectBuilderNode,
  ],
  exports: [CodeGenWorkflow],
})
export class WorkflowModule {}
