import { Injectable } from "@nestjs/common";
import { HtmlCodeParser } from "./html-code-parser";
import { MultiFileCodeParser } from "./multi-file-code-parser";
import { HtmlCodeResult, MultiFileCodeResult } from "./code-parser.interface";
import { CodeGenType } from "@/common";

/**
 * 代码解析执行器
 * 根据代码生成类型选择对应的解析器
 */
@Injectable()
export class CodeParserExecutor {
  constructor(
    private readonly htmlCodeParser: HtmlCodeParser,
    private readonly multiFileCodeParser: MultiFileCodeParser,
  ) {}

  /**
   * 执行代码解析
   */
  executeParser(
    rawCode: string,
    codeGenType: CodeGenType,
  ): HtmlCodeResult | MultiFileCodeResult {
    switch (codeGenType) {
      case CodeGenType.HTML:
        return this.htmlCodeParser.parse(rawCode);

      case CodeGenType.MULTI_FILE:
      case CodeGenType.VUE_PROJECT:
        return this.multiFileCodeParser.parse(rawCode);

      default:
        // 默认使用 HTML 解析器
        return this.htmlCodeParser.parse(rawCode);
    }
  }
}
