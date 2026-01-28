import * as path from "path";

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
