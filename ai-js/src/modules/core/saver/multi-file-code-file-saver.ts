import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { CodeFileSaver } from "./code-file-saver.interface";
import { MultiFileCodeResult } from "../parser/code-parser.interface";

/**
 * 代码输出根目录
 */
const CODE_OUTPUT_ROOT_DIR = path.join(process.cwd(), "tmp", "code_output");

/**
 * 多文件代码保存器
 */
@Injectable()
export class MultiFileCodeFileSaver implements CodeFileSaver<MultiFileCodeResult> {
  private readonly logger = new Logger(MultiFileCodeFileSaver.name);

  /**
   * 保存多文件代码
   */
  save(result: MultiFileCodeResult, appId: string): string {
    // 构建输出目录
    const outputDirName = `multi_file_${appId}`;
    const outputDir = path.join(CODE_OUTPUT_ROOT_DIR, outputDirName);

    // 确保目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 保存每个文件
    for (const file of result.files) {
      const filePath = path.join(outputDir, file.filePath);
      const fileDir = path.dirname(filePath);

      // 确保文件目录存在
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      fs.writeFileSync(filePath, file.content, "utf-8");
      this.logger.debug(`文件已保存: ${filePath}`);
    }

    this.logger.log(
      `多文件代码已保存到: ${outputDir}，共 ${result.files.length} 个文件`,
    );
    return outputDir;
  }
}
