import { CodeGenType } from "../../common/enums/code-gen-type.enum";

/**
 * HTML 代码解析结果
 */
export interface HtmlCodeResult {
  /** HTML 代码内容 */
  htmlCode: string;
}

/**
 * 多文件代码项
 */
export interface FileCodeItem {
  /** 文件路径 */
  filePath: string;
  /** 文件内容 */
  content: string;
}

/**
 * 多文件代码解析结果
 */
export interface MultiFileCodeResult {
  /** 文件列表 */
  files: FileCodeItem[];
}

/**
 * 代码解析器接口
 */
export interface CodeParser<T> {
  /**
   * 解析代码
   * @param rawCode 原始代码字符串
   * @returns 解析结果
   */
  parse(rawCode: string): T;
}
