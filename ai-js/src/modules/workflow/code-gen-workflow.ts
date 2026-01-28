import { Injectable, Logger } from "@nestjs/common";
import { Subject, Observable, from } from "rxjs";
import { mergeMap, catchError, tap } from "rxjs/operators";
import {
  WorkflowContext,
  createWorkflowContext,
} from "./state/workflow-context";
import { WorkflowNode } from "./nodes/base-node";
import { ImageCollectorNode } from "./nodes/image-collector-node";
import { PromptEnhancerNode } from "./nodes/prompt-enhancer-node";
import { RouterNode } from "./nodes/router-node";
import { CodeGeneratorNode } from "./nodes/code-generator-node";
import { CodeQualityCheckNode } from "./nodes/code-quality-check-node";
import { ProjectBuilderNode } from "./nodes/project-builder-node";
import { CodeGenType } from "../../common/enums/code-gen-type.enum";

/**
 * 工作流步骤事件
 */
export interface WorkflowStepEvent {
  type:
    | "step_start"
    | "step_completed"
    | "workflow_start"
    | "workflow_completed"
    | "workflow_error";
  stepName?: string;
  stepNumber?: number;
  context?: WorkflowContext;
  error?: string;
  message?: string;
}

/**
 * 代码生成工作流
 * 实现完整的代码生成流程：
 * 1. 图片收集 -> 2. 提示增强 -> 3. 路由选择 -> 4. 代码生成 -> 5. 质量检查 -> 6. 项目构建
 */
@Injectable()
export class CodeGenWorkflow {
  private readonly logger = new Logger(CodeGenWorkflow.name);

  constructor(
    private readonly imageCollectorNode: ImageCollectorNode,
    private readonly promptEnhancerNode: PromptEnhancerNode,
    private readonly routerNode: RouterNode,
    private readonly codeGeneratorNode: CodeGeneratorNode,
    private readonly codeQualityCheckNode: CodeQualityCheckNode,
    private readonly projectBuilderNode: ProjectBuilderNode,
  ) {}

  /**
   * 获取工作流节点列表
   */
  private getNodes(): WorkflowNode[] {
    return [
      this.imageCollectorNode,
      this.promptEnhancerNode,
      this.routerNode,
      this.codeGeneratorNode,
      this.codeQualityCheckNode,
      this.projectBuilderNode,
    ];
  }

  /**
   * 执行工作流
   */
  async executeWorkflow(
    originalPrompt: string,
    options?: {
      appId?: string;
      userId?: string;
      generationType?: CodeGenType;
    },
  ): Promise<WorkflowContext> {
    this.logger.log("开始执行代码生成工作流");

    let context = createWorkflowContext(originalPrompt, {
      appId: options?.appId,
      userId: options?.userId,
      generationType: options?.generationType,
    });

    const nodes = this.getNodes();

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      this.logger.log(`--- 执行步骤 ${i + 1}: ${node.name} ---`);

      try {
        context = await node.execute(context);

        // 检查质量检查结果，决定是否需要重试
        if (
          node.name === "code_quality_check" &&
          context.qualityResult &&
          !context.qualityResult.isValid
        ) {
          const retryCount = context.retryCount || 0;
          const maxRetries = context.maxRetries || 3;

          if (retryCount < maxRetries) {
            this.logger.warn(`代码质量检查未通过，重试第 ${retryCount + 1} 次`);
            context = { ...context, retryCount: retryCount + 1 };
            // 回退到代码生成节点
            i = nodes.findIndex((n) => n.name === "code_generator") - 1;
            continue;
          } else {
            this.logger.error("代码质量检查多次未通过，使用当前结果");
          }
        }

        // 检查是否需要跳过构建
        if (node.name === "code_quality_check") {
          const genType = context.generationType;
          if (
            genType === CodeGenType.HTML ||
            genType === CodeGenType.MULTI_FILE
          ) {
            this.logger.log(`${genType} 类型不需要构建，跳过构建节点`);
            // 仍然执行保存
            context = await this.projectBuilderNode.execute(context);
            break;
          }
        }

        if (context.error) {
          this.logger.error(`节点 ${node.name} 执行出错: ${context.error}`);
          break;
        }
      } catch (error) {
        this.logger.error(
          `节点 ${node.name} 执行异常: ${(error as Error).message}`,
        );
        context = { ...context, error: (error as Error).message };
        break;
      }
    }

    this.logger.log("代码生成工作流执行完成");
    return context;
  }

  /**
   * 执行工作流（流式版本）
   */
  executeWorkflowWithStream(
    originalPrompt: string,
    options?: {
      appId?: string;
      userId?: string;
      generationType?: CodeGenType;
    },
  ): Observable<WorkflowStepEvent> {
    const subject = new Subject<WorkflowStepEvent>();

    // 异步执行工作流
    (async () => {
      subject.next({
        type: "workflow_start",
        message: "开始执行代码生成工作流",
      });

      let context = createWorkflowContext(originalPrompt, {
        appId: options?.appId,
        userId: options?.userId,
        generationType: options?.generationType,
      });

      const nodes = this.getNodes();

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        subject.next({
          type: "step_start",
          stepName: node.name,
          stepNumber: i + 1,
        });

        try {
          context = await node.execute(context);

          subject.next({
            type: "step_completed",
            stepName: node.name,
            stepNumber: i + 1,
            context,
          });

          // 质量检查重试逻辑
          if (
            node.name === "code_quality_check" &&
            context.qualityResult &&
            !context.qualityResult.isValid
          ) {
            const retryCount = context.retryCount || 0;
            const maxRetries = context.maxRetries || 3;

            if (retryCount < maxRetries) {
              context = { ...context, retryCount: retryCount + 1 };
              i = nodes.findIndex((n) => n.name === "code_generator") - 1;
              continue;
            }
          }

          // 跳过构建检查
          if (node.name === "code_quality_check") {
            const genType = context.generationType;
            if (
              genType === CodeGenType.HTML ||
              genType === CodeGenType.MULTI_FILE
            ) {
              context = await this.projectBuilderNode.execute(context);
              subject.next({
                type: "step_completed",
                stepName: "project_builder",
                stepNumber: nodes.length,
                context,
              });
              break;
            }
          }

          if (context.error) {
            subject.next({
              type: "workflow_error",
              error: context.error,
            });
            break;
          }
        } catch (error) {
          subject.next({
            type: "workflow_error",
            error: (error as Error).message,
          });
          break;
        }
      }

      subject.next({
        type: "workflow_completed",
        message: "代码生成工作流执行完成",
        context,
      });

      subject.complete();
    })();

    return subject.asObservable();
  }

  /**
   * 获取工作流图（Mermaid 格式）
   */
  getWorkflowGraph(): string {
    return `
graph TD
    START((开始)) --> image_collector[图片收集]
    image_collector --> prompt_enhancer[提示增强]
    prompt_enhancer --> router[路由选择]
    router --> code_generator[代码生成]
    code_generator --> code_quality_check{质量检查}
    code_quality_check -->|通过| project_builder[项目构建]
    code_quality_check -->|未通过| code_generator
    project_builder --> END((结束))
    
    style START fill:#9f9
    style END fill:#f99
    style code_quality_check fill:#ff9
`;
  }
}
