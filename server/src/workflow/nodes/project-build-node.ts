import { Injectable, Logger } from '@nestjs/common';
import { execSync } from 'child_process';
import { join } from 'path';
import { CodegenType } from '../../common/enums/codegen-type';
import { WorkflowStateType } from '../models/workflow-context';
import { ensureDir } from '../../common/utils/ensure-dir.util';

@Injectable()
export class ProjectBuildNode {
  private readonly logger = new Logger(ProjectBuildNode.name);

  execute(state: WorkflowStateType): Promise<Partial<WorkflowStateType>> {
    this.logger.log('Executing project build node');

    if (state.codegenType !== CodegenType.VITE_PROJECT) {
      return Promise.resolve({ buildSuccess: true });
    }

    const projectDir = join(
      process.cwd(),
      'tmp',
      'code_output',
      `${state.codegenType}_${state.appId || 'workflow'}`,
    );
    ensureDir(projectDir);

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
      return Promise.resolve({ buildSuccess: true });
    } catch (err) {
      this.logger.error('Project build failed', err);
      return Promise.resolve({
        buildSuccess: false,
        error: `Build failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }
}
