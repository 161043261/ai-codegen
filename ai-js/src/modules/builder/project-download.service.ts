import { Injectable, Logger } from "@nestjs/common";
import { Response } from "express";
import * as fs from "fs";
import * as path from "path";
import archiver from "archiver";
import { BusinessException } from "../../common/business.exception";

/**
 * 需要过滤的文件和目录
 */
const IGNORED_NAMES = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".DS_Store",
  ".env",
  "target",
  ".mvn",
  ".idea",
  ".vscode",
]);

/**
 * 需要过滤的文件扩展名
 */
const IGNORED_EXTENSIONS = new Set([".log", ".tmp", ".cache"]);

/**
 * 项目下载服务
 * 将项目打包为 ZIP 文件供下载
 */
@Injectable()
export class ProjectDownloadService {
  private readonly logger = new Logger(ProjectDownloadService.name);

  /**
   * 下载项目为 ZIP 文件
   * @param projectPath 项目路径
   * @param downloadFileName 下载文件名（不含扩展名）
   * @param response Express Response 对象
   */
  async downloadProjectAsZip(
    projectPath: string,
    downloadFileName: string,
    response: Response,
  ): Promise<void> {
    // 参数校验
    if (!projectPath || projectPath.trim().length === 0) {
      throw BusinessException.paramsError("项目路径不能为空");
    }
    if (!downloadFileName || downloadFileName.trim().length === 0) {
      throw BusinessException.paramsError("下载文件名不能为空");
    }

    // 检查项目目录
    if (!fs.existsSync(projectPath)) {
      throw BusinessException.paramsError("项目路径不存在");
    }

    const stats = fs.statSync(projectPath);
    if (!stats.isDirectory()) {
      throw BusinessException.paramsError("项目路径不是一个目录");
    }

    this.logger.log(
      `开始打包下载项目: ${projectPath} -> ${downloadFileName}.zip`,
    );

    // 设置响应头
    response.set({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${downloadFileName}.zip"`,
    });

    // 创建 archiver 实例
    const archive = archiver("zip", {
      zlib: { level: 9 }, // 最高压缩级别
    });

    // 处理错误
    archive.on("error", (err) => {
      this.logger.error(`打包项目失败: ${err.message}`);
      throw BusinessException.systemError("打包下载项目失败");
    });

    // 将 archive 流 pipe 到响应
    archive.pipe(response);

    // 添加文件（带过滤）
    await this.addDirectoryToArchive(archive, projectPath, "");

    // 完成打包
    await archive.finalize();

    this.logger.log(
      `打包下载项目成功: ${projectPath} -> ${downloadFileName}.zip`,
    );
  }

  /**
   * 递归添加目录到压缩包
   */
  private async addDirectoryToArchive(
    archive: archiver.Archiver,
    dirPath: string,
    relativePath: string,
  ): Promise<void> {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      const entryRelativePath = relativePath
        ? `${relativePath}/${entry.name}`
        : entry.name;

      // 检查是否应该忽略
      if (this.shouldIgnore(entry.name)) {
        continue;
      }

      if (entry.isDirectory()) {
        // 递归处理子目录
        await this.addDirectoryToArchive(archive, entryPath, entryRelativePath);
      } else {
        // 添加文件
        archive.file(entryPath, { name: entryRelativePath });
      }
    }
  }

  /**
   * 判断是否应该忽略
   */
  private shouldIgnore(name: string): boolean {
    // 检查是否在忽略名称列表中
    if (IGNORED_NAMES.has(name)) {
      return true;
    }

    // 检查扩展名
    for (const ext of IGNORED_EXTENSIONS) {
      if (name.toLowerCase().endsWith(ext)) {
        return true;
      }
    }

    return false;
  }
}
