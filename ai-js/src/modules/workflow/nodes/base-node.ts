import { WorkflowContext } from "../state/workflow-context";

/**
 * 工作流节点接口
 */
export interface WorkflowNode {
  /** 节点名称 */
  readonly name: string;

  /**
   * 执行节点逻辑
   * @param context 工作流上下文
   * @returns 更新后的上下文
   */
  execute(context: WorkflowContext): Promise<WorkflowContext>;
}

/**
 * 基础工作流节点
 */
export abstract class BaseWorkflowNode implements WorkflowNode {
  abstract readonly name: string;

  abstract execute(context: WorkflowContext): Promise<WorkflowContext>;

  /**
   * 更新上下文的当前步骤
   */
  protected updateStep(
    context: WorkflowContext,
    step: string,
  ): WorkflowContext {
    return {
      ...context,
      currentStep: step,
    };
  }

  /**
   * 设置错误
   */
  protected setError(context: WorkflowContext, error: string): WorkflowContext {
    return {
      ...context,
      error,
    };
  }
}
