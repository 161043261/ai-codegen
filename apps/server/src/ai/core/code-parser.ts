import { CodegenType } from '../../common/enums/codegen-type';

export interface ParsedCode {
  files: { filename: string; content: string }[];
}

export class CodeParser {
  private static readonly HTML_REGEX = /```html\s*\n([\s\S]*?)```/i;
  private static readonly CSS_REGEX = /```css\s*\n([\s\S]*?)```/i;
  private static readonly JS_REGEX = /```(?:js|javascript)\s*\n([\s\S]*?)```/i;

  static parse(content: string, codegenType: CodegenType): ParsedCode {
    switch (codegenType) {
      case CodegenType.VANILLA_HTML:
        return CodeParser.parseVanillaHtml(content);
      case CodegenType.MULTI_FILES:
        return CodeParser.parseMultiFiles(content);
      default:
        return { files: [] };
    }
  }

  private static extractCodeByPattern(
    content: string,
    pattern: RegExp,
  ): string {
    const match = content.match(pattern);
    return match ? match[1].trim() : '';
  }

  private static parseVanillaHtml(content: string): ParsedCode {
    const htmlCode = CodeParser.extractCodeByPattern(
      content,
      CodeParser.HTML_REGEX,
    );
    return {
      files: [{ filename: 'index.html', content: htmlCode || content }],
    };
  }

  private static parseMultiFiles(content: string): ParsedCode {
    const files: { filename: string; content: string }[] = [];
    const htmlCode = CodeParser.extractCodeByPattern(
      content,
      CodeParser.HTML_REGEX,
    );
    files.push({ filename: 'index.html', content: htmlCode || content });
    const cssCode = CodeParser.extractCodeByPattern(
      content,
      CodeParser.CSS_REGEX,
    );
    files.push({ filename: 'index.css', content: cssCode || '' });
    const jsCode = CodeParser.extractCodeByPattern(
      content,
      CodeParser.JS_REGEX,
    );
    files.push({ filename: 'index.js', content: jsCode || '' });
    return { files };
  }
}
