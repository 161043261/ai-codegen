import { Injectable } from "@nestjs/common";
import { CodeGenType } from "../../common/enums/code-gen-type.enum";
import { HtmlCodeFileSaver } from "./html-code-file-saver";
import { MultiFileCodeFileSaver } from "./multi-file-code-file-saver";
import {
  HtmlCodeResult,
  MultiFileCodeResult,
} from "../parser/code-parser.interface";

/**
 * 代码文件保存执行器
 * 根据代码生成类型选择对应的保存器
 */
@Injectable()
export class CodeFileSaverExecutor {
  constructor(
    private readonly htmlCodeFileSaver: HtmlCodeFileSaver,
    private readonly multiFileCodeFileSaver: MultiFileCodeFileSaver,
  ) {}

  /**
   * 执行代码保存
   */
  executeSaver(
    result: HtmlCodeResult | MultiFileCodeResult,
    codeGenType: CodeGenType,
    appId: string,
  ): string {
    switch (codeGenType) {
      case CodeGenType.HTML:
        return this.htmlCodeFileSaver.save(result as HtmlCodeResult, appId);

      case CodeGenType.MULTI_FILE:
      case CodeGenType.VUE_PROJECT:
        return this.multiFileCodeFileSaver.save(
          result as MultiFileCodeResult,
          appId,
        );

      default:
        // 默认使用 HTML 保存器
        return this.htmlCodeFileSaver.save(result as HtmlCodeResult, appId);
    }
  }
}
