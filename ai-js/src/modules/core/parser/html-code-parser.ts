import { Injectable, Logger } from "@nestjs/common";
import { CodeParser, HtmlCodeResult } from "./code-parser.interface";

/**
 * HTML 代码块正则表达式
 */
const HTML_CODE_BLOCK_PATTERN = /```html\s*([\s\S]*?)```/i;

/**
 * HTML 代码解析器
 * 从 AI 响应中提取 HTML 代码
 */
@Injectable()
export class HtmlCodeParser implements CodeParser<HtmlCodeResult> {
  private readonly logger = new Logger(HtmlCodeParser.name);

  /**
   * 解析 HTML 代码
   */
  parse(rawCode: string): HtmlCodeResult {
    // 尝试从代码块中提取 HTML
    const match = rawCode.match(HTML_CODE_BLOCK_PATTERN);

    if (match && match[1]) {
      const htmlCode = match[1].trim();
      this.logger.debug(`从代码块中提取 HTML，长度: ${htmlCode.length}`);
      return { htmlCode };
    }

    // 如果没有代码块，检查是否是完整的 HTML
    if (this.isValidHtml(rawCode)) {
      this.logger.debug(`直接使用原始内容作为 HTML，长度: ${rawCode.length}`);
      return { htmlCode: rawCode.trim() };
    }

    // 尝试提取任意代码块
    const anyCodeBlock = rawCode.match(/```[\w]*\s*([\s\S]*?)```/);
    if (anyCodeBlock && anyCodeBlock[1]) {
      const code = anyCodeBlock[1].trim();
      if (this.isValidHtml(code)) {
        this.logger.debug(`从通用代码块中提取 HTML，长度: ${code.length}`);
        return { htmlCode: code };
      }
    }

    this.logger.warn("未能解析出有效的 HTML 代码");
    return { htmlCode: rawCode.trim() };
  }

  /**
   * 检查是否是有效的 HTML
   */
  private isValidHtml(content: string): boolean {
    const trimmed = content.trim();
    return (
      trimmed.includes("<!DOCTYPE") ||
      trimmed.includes("<html") ||
      (trimmed.startsWith("<") && trimmed.endsWith(">"))
    );
  }
}
