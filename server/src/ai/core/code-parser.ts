import { CodegenType } from '../../common/enums/codegen-type.enum';

export interface ParsedCode {
  files: { filename: string; content: string }[];
}

export class CodeParser {
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

  private static parseVanillaHtml(content: string): ParsedCode {
    const htmlMatch = content.match(/```(?:html)?\s*\n([\s\S]*?)```/);
    if (htmlMatch) {
      return {
        files: [{ filename: 'index.html', content: htmlMatch[1].trim() }],
      };
    }
    return { files: [{ filename: 'index.html', content }] };
  }

  private static parseMultiFiles(content: string): ParsedCode {
    const files: { filename: string; content: string }[] = [];
    const fileRegex = /```(\w+)?\s*(?:\/\/\s*)?(\S+\.\w+)\s*\n([\s\S]*?)```/g;

    let match: RegExpExecArray | null;
    while ((match = fileRegex.exec(content)) !== null) {
      const filename = match[2];
      const fileContent = match[3].trim();
      files.push({ filename, content: fileContent });
    }

    if (files.length === 0) {
      const htmlMatch = content.match(/```(?:html)?\s*\n([\s\S]*?)```/);
      if (htmlMatch) {
        files.push({ filename: 'index.html', content: htmlMatch[1].trim() });
      }
    }

    return { files };
  }
}
