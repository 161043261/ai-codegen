import { Injectable, Logger } from "@nestjs/common";
import { BaseWorkflowNode } from "./base-node";
import { WorkflowContext } from "../state/workflow-context";
import { CodeGenType } from "../../../common/enums/code-gen-type.enum";
import { CodeParserExecutor } from "../../core/parser/code-parser-executor";
import { CodeFileSaverExecutor } from "../../core/saver/code-file-saver-executor";
import { VueProjectBuilder } from "../../builder/vue-project-builder";

/**
 * 项目构建节点
 * 解析代码、保存文件、构建项目
 */
@Injectable()
export class ProjectBuilderNode extends BaseWorkflowNode {
  readonly name = "project_builder";
  private readonly logger = new Logger(ProjectBuilderNode.name);

  constructor(
    private readonly codeParserExecutor: CodeParserExecutor,
    private readonly codeFileSaverExecutor: CodeFileSaverExecutor,
    private readonly vueProjectBuilder: VueProjectBuilder,
  ) {
    super();
  }

  async execute(context: WorkflowContext): Promise<WorkflowContext> {
    this.logger.log("开始执行项目构建节点");

    const updatedContext = this.updateStep(context, "构建项目");

    if (!context.generatedCode) {
      return this.setError(updatedContext, "没有生成的代码，无法构建项目");
    }

    try {
      const codeGenType = context.generationType || CodeGenType.HTML;
      const appId = context.appId || `temp_${Date.now()}`;

      // 解析代码
      this.logger.log("解析代码...");
      const parsedResult = this.codeParserExecutor.executeParser(
        context.generatedCode,
        codeGenType,
      );

      // 保存文件
      this.logger.log("保存文件...");
      const outputPath = this.codeFileSaverExecutor.executeSaver(
        parsedResult,
        codeGenType,
        appId,
      );

      // 如果是 Vue 项目，执行构建
      if (codeGenType === CodeGenType.VUE_PROJECT) {
        this.logger.log("构建 Vue 项目...");
        const buildSuccess =
          await this.vueProjectBuilder.buildProject(outputPath);
        if (!buildSuccess) {
          this.logger.warn("Vue 项目构建失败，但文件已保存");
        }
      }

      this.logger.log(`项目构建完成，输出路径: ${outputPath}`);

      return {
        ...updatedContext,
        outputPath,
      };
    } catch (error) {
      this.logger.error(`项目构建失败: ${(error as Error).message}`);
      return this.setError(updatedContext, (error as Error).message);
    }
  }
}
