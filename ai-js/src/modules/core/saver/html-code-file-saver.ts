import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { CodeFileSaver } from "./code-file-saver.interface";
import { HtmlCodeResult } from "../parser/code-parser.interface";

/**
 * 代码输出根目录
 */
const CODE_OUTPUT_ROOT_DIR = path.join(process.cwd(), "tmp", "code_output");

/**
 * HTML 代码文件保存器
 */
@Injectable()
export class HtmlCodeFileSaver implements CodeFileSaver<HtmlCodeResult> {
  private readonly logger = new Logger(HtmlCodeFileSaver.name);

  /**
   * 保存 HTML 代码到文件
   */
  save(result: HtmlCodeResult, appId: string): string {
    // 构建输出目录
    const outputDirName = `html_${appId}`;
    const outputDir = path.join(CODE_OUTPUT_ROOT_DIR, outputDirName);

    // 确保目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 保存 HTML 文件
    const filePath = path.join(outputDir, "index.html");
    fs.writeFileSync(filePath, result.htmlCode, "utf-8");

    this.logger.log(`HTML 代码已保存到: ${filePath}`);
    return outputDir;
  }
}
