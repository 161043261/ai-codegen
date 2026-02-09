import { Injectable, Logger } from '@nestjs/common';
import { StateGraph, END, START } from '@langchain/langgraph';
import { WorkflowState, WorkflowStateType } from './models/workflow-context';
import { PromptEnhanceNode } from './nodes/prompt-enhance.node';
import { RouterNode } from './nodes/router.node';
import { CodegenNode } from './nodes/codegen.node';
import { CodeQualityCheckNode } from './nodes/code-quality-check.node';
import { ProjectBuildNode } from './nodes/project-build.node';
import { CodegenType } from '../common/enums/codegen-type.enum';

@Injectable()
export class CodegenWorkflowService {
  private readonly logger = new Logger(CodegenWorkflowService.name);

  constructor(
    private readonly promptEnhanceNode: PromptEnhanceNode,
    private readonly routerNode: RouterNode,
    private readonly codegenNode: CodegenNode,
    private readonly codeQualityCheckNode: CodeQualityCheckNode,
    private readonly projectBuildNode: ProjectBuildNode,
  ) {}

  async execute(userPrompt: string): Promise<WorkflowStateType> {
    const graph = this.buildGraph();
    const compiled = graph.compile();

    const result = await compiled.invoke({
      userPrompt,
      enhancedPrompt: '',
      codegenType: '',
      generatedCode: '',
      qualityCheckPassed: false,
      qualityCheckMessage: '',
      buildSuccess: false,
      appId: '',
      error: '',
    });

    return result as WorkflowStateType;
  }

  async *executeStream(
    userPrompt: string,
  ): AsyncGenerator<{ event: string; data: any }> {
    const graph = this.buildGraph();
    const compiled = graph.compile();

    yield { event: 'workflow-start', data: { prompt: userPrompt } };

    try {
      const stream = await compiled.stream({
        userPrompt,
        enhancedPrompt: '',
        codegenType: '',
        generatedCode: '',
        qualityCheckPassed: false,
        qualityCheckMessage: '',
        buildSuccess: false,
        appId: '',
        error: '',
      });

      for await (const update of stream) {
        const nodeName = Object.keys(update)[0];
        yield {
          event: 'step-complete',
          data: { node: nodeName, state: update[nodeName] },
        };
      }

      yield { event: 'workflow-complete', data: {} };
    } catch (error: any) {
      yield { event: 'workflow-error', data: { error: error.message } };
    }
  }

  private buildGraph() {
    const graph = new StateGraph(WorkflowState)
      .addNode('promptEnhance', async (state) =>
        this.promptEnhanceNode.execute(state),
      )
      .addNode('router', async (state) => this.routerNode.execute(state))
      .addNode('codegen', async (state) => this.codegenNode.execute(state))
      .addNode('codeQualityCheck', async (state) =>
        this.codeQualityCheckNode.execute(state),
      )
      .addNode('projectBuild', async (state) =>
        this.projectBuildNode.execute(state),
      )
      .addEdge(START, 'promptEnhance')
      .addEdge('promptEnhance', 'router')
      .addEdge('router', 'codegen')
      .addEdge('codegen', 'codeQualityCheck')
      .addConditionalEdges('codeQualityCheck', (state) => {
        if (!state.qualityCheckPassed) {
          return 'codegen';
        }
        if (state.codegenType === CodegenType.VITE_PROJECT) {
          return 'projectBuild';
        }
        return END;
      })
      .addEdge('projectBuild', END);

    return graph;
  }
}
