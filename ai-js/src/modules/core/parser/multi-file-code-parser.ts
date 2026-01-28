import { Injectable, Logger } from "@nestjs/common";
import {
  CodeParser,
  MultiFileCodeResult,
  FileCodeItem,
} from "./code-parser.interface";

/**
 * 文件标记正则表达式
 * 支持多种格式：
 * - <!-- file: path/to/file.ext -->
 * - // file: path/to/file.ext
 * - # file: path/to/file.ext
 */
const FILE_MARKER_PATTERNS = [
  /<!--\s*file:\s*([^\s>]+)\s*-->/gi,
  /\/\/\s*file:\s*([^\s\n]+)/gi,
  /#\s*file:\s*([^\s\n]+)/gi,
];

/**
 * 代码块正则表达式
 */
const CODE_BLOCK_PATTERN = /```(\w*)\s*([\s\S]*?)```/g;

/**
 * 多文件代码解析器
 * 从 AI 响应中提取多个文件的代码
 */
@Injectable()
export class MultiFileCodeParser implements CodeParser<MultiFileCodeResult> {
  private readonly logger = new Logger(MultiFileCodeParser.name);

  /**
   * 解析多文件代码
   */
  parse(rawCode: string): MultiFileCodeResult {
    const files: FileCodeItem[] = [];
    const processedPaths = new Set<string>();

    // 方法1: 尝试解析带有文件标记的代码块
    const markedFiles = this.parseWithFileMarkers(rawCode);
    for (const file of markedFiles) {
      if (!processedPaths.has(file.filePath)) {
        files.push(file);
        processedPaths.add(file.filePath);
      }
    }

    // 方法2: 如果没有找到带标记的文件，尝试根据代码块语言推断
    if (files.length === 0) {
      const inferredFiles = this.parseByLanguageInference(rawCode);
      for (const file of inferredFiles) {
        if (!processedPaths.has(file.filePath)) {
          files.push(file);
          processedPaths.add(file.filePath);
        }
      }
    }

    this.logger.debug(`解析出 ${files.length} 个文件`);
    return { files };
  }

  /**
   * 使用文件标记解析
   */
  private parseWithFileMarkers(rawCode: string): FileCodeItem[] {
    const files: FileCodeItem[] = [];
    const lines = rawCode.split("\n");

    let currentFilePath: string | null = null;
    let currentContent: string[] = [];
    let inCodeBlock = false;

    for (const line of lines) {
      // 检查文件标记
      for (const pattern of FILE_MARKER_PATTERNS) {
        pattern.lastIndex = 0;
        const match = pattern.exec(line);
        if (match) {
          // 保存之前的文件
          if (currentFilePath && currentContent.length > 0) {
            files.push({
              filePath: currentFilePath,
              content: this.extractCodeFromContent(currentContent.join("\n")),
            });
          }
          currentFilePath = match[1].trim();
          currentContent = [];
          break;
        }
      }

      // 收集内容
      if (currentFilePath) {
        currentContent.push(line);
      }
    }

    // 保存最后一个文件
    if (currentFilePath && currentContent.length > 0) {
      files.push({
        filePath: currentFilePath,
        content: this.extractCodeFromContent(currentContent.join("\n")),
      });
    }

    return files;
  }

  /**
   * 根据语言推断文件
   */
  private parseByLanguageInference(rawCode: string): FileCodeItem[] {
    const files: FileCodeItem[] = [];
    const languageMap: Record<string, string> = {
      html: "index.html",
      css: "styles.css",
      javascript: "script.js",
      js: "script.js",
      typescript: "script.ts",
      ts: "script.ts",
      vue: "App.vue",
      json: "data.json",
    };

    let match: RegExpExecArray | null;
    CODE_BLOCK_PATTERN.lastIndex = 0;

    const usedNames = new Set<string>();

    while ((match = CODE_BLOCK_PATTERN.exec(rawCode)) !== null) {
      const language = match[1].toLowerCase();
      const content = match[2].trim();

      if (content.length > 0) {
        let fileName = languageMap[language] || `file.${language || "txt"}`;

        // 处理重复文件名
        if (usedNames.has(fileName)) {
          const ext = fileName.split(".").pop() || "";
          const base = fileName.replace(`.${ext}`, "");
          let counter = 2;
          while (usedNames.has(`${base}_${counter}.${ext}`)) {
            counter++;
          }
          fileName = `${base}_${counter}.${ext}`;
        }

        usedNames.add(fileName);
        files.push({
          filePath: fileName,
          content,
        });
      }
    }

    return files;
  }

  /**
   * 从内容中提取代码（移除代码块标记）
   */
  private extractCodeFromContent(content: string): string {
    // 尝试提取代码块内容
    const match = content.match(/```[\w]*\s*([\s\S]*?)```/);
    if (match && match[1]) {
      return match[1].trim();
    }
    return content.trim();
  }
}
