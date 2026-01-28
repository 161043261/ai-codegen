import * as fs from "fs";
import * as path from "path";
import { CodeGenType } from "../../common/enums/code-gen-type.enum";
import {
  HtmlCodeResult,
  MultiFileCodeResult,
  FileCodeItem,
} from "../parser/code-parser.interface";

/**
 * 代码输出根目录
 */
const CODE_OUTPUT_ROOT_DIR = path.join(process.cwd(), "tmp", "code_output");

/**
 * 代码文件保存器接口
 */
export interface CodeFileSaver<T> {
  /**
   * 保存代码到文件
   * @param result 解析结果
   * @param appId 应用 ID
   * @returns 保存的目录路径
   */
  save(result: T, appId: string): string;
}
