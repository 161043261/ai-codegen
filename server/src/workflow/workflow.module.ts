import { Module } from '@nestjs/common';
import { WorkflowController } from './workflow.controller';
import { CodegenWorkflowService } from './codegen-workflow.service';
import { PromptEnhanceNode } from './nodes/prompt-enhance-node';
import { RouterNode } from './nodes/router-node';
import { CodegenNode } from './nodes/codegen-node';
import { CodeQualityCheckNode } from './nodes/code-quality-check-node';
import { ProjectBuildNode } from './nodes/project-build-node';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [WorkflowController],
  providers: [
    CodegenWorkflowService,
    PromptEnhanceNode,
    RouterNode,
    CodegenNode,
    CodeQualityCheckNode,
    ProjectBuildNode,
  ],
})
export class WorkflowModule {}
