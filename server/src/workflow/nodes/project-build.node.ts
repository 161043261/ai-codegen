import { Injectable, Logger } from '@nestjs/common';
import { execSync } from 'child_process';
import * as path from 'path';
import { CodegenType } from '../../common/enums/codegen-type.enum';
import { WorkflowStateType } from '../models/workflow-context';

@Injectable()
export class ProjectBuildNode {
  private readonly logger = new Logger(ProjectBuildNode.name);

  async execute(state: WorkflowStateType): Promise<Partial<WorkflowStateType>> {
    this.logger.log('Executing ProjectBuildNode');

    if (state.codegenType !== CodegenType.VITE_PROJECT) {
      return { buildSuccess: true };
    }

    const projectDir = path.join(
      process.cwd(),
      'tmp',
      'code_output',
      `${state.codegenType}_${state.appId || 'workflow'}`,
    );

    try {
      execSync('npm install', {
        cwd: projectDir,
        timeout: 300000,
        stdio: 'pipe',
      });
      execSync('npm run build', {
        cwd: projectDir,
        timeout: 300000,
        stdio: 'pipe',
      });
      return { buildSuccess: true };
    } catch (error: any) {
      this.logger.error('Project build failed', error);
      return {
        buildSuccess: false,
        error: `Build failed: ${error.message}`,
      };
    }
  }
}
