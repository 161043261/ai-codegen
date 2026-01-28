import { Injectable, Logger } from "@nestjs/common";
import { spawn, ChildProcess } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

/**
 * Vue 项目构建器
 * 自动执行 npm install 和 npm run build
 */
@Injectable()
export class VueProjectBuilder {
  private readonly logger = new Logger(VueProjectBuilder.name);

  /**
   * 异步构建 Vue 项目
   */
  buildProjectAsync(projectPath: string): void {
    setImmediate(async () => {
      try {
        await this.buildProject(projectPath);
      } catch (error) {
        this.logger.error(
          `异步构建 Vue 项目时发生异常: ${(error as Error).message}`,
        );
      }
    });
  }

  /**
   * 构建 Vue 项目
   * @param projectPath 项目根目录路径
   * @returns 是否构建成功
   */
  async buildProject(projectPath: string): Promise<boolean> {
    // 检查项目目录
    if (!fs.existsSync(projectPath)) {
      this.logger.error(`项目目录不存在：${projectPath}`);
      return false;
    }

    const stats = fs.statSync(projectPath);
    if (!stats.isDirectory()) {
      this.logger.error(`路径不是目录：${projectPath}`);
      return false;
    }

    // 检查 package.json
    const packageJsonPath = path.join(projectPath, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      this.logger.error(`项目目录中没有 package.json 文件：${projectPath}`);
      return false;
    }

    this.logger.log(`开始构建 Vue 项目：${projectPath}`);

    // 执行 npm install
    const installSuccess = await this.executeNpmInstall(projectPath);
    if (!installSuccess) {
      this.logger.error(`npm install 执行失败：${projectPath}`);
      return false;
    }

    // 执行 npm run build
    const buildSuccess = await this.executeNpmBuild(projectPath);
    if (!buildSuccess) {
      this.logger.error(`npm run build 执行失败：${projectPath}`);
      return false;
    }

    // 验证 dist 目录
    const distDir = path.join(projectPath, "dist");
    if (!fs.existsSync(distDir)) {
      this.logger.error(`构建完成但 dist 目录未生成：${projectPath}`);
      return false;
    }

    this.logger.log(`Vue 项目构建成功，dist 目录：${distDir}`);
    return true;
  }

  /**
   * 执行 npm install
   */
  private async executeNpmInstall(projectPath: string): Promise<boolean> {
    this.logger.log("执行 npm install...");
    return this.executeCommand(projectPath, "npm", ["install"], 300);
  }

  /**
   * 执行 npm run build
   */
  private async executeNpmBuild(projectPath: string): Promise<boolean> {
    this.logger.log("执行 npm run build...");
    return this.executeCommand(projectPath, "npm", ["run", "build"], 180);
  }

  /**
   * 执行命令
   */
  private executeCommand(
    workingDir: string,
    command: string,
    args: string[],
    timeoutSeconds: number,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const isWindows = os.platform() === "win32";
      const actualCommand = isWindows ? `${command}.cmd` : command;

      this.logger.log(
        `在目录 ${workingDir} 中执行命令: ${actualCommand} ${args.join(" ")}`,
      );

      const process: ChildProcess = spawn(actualCommand, args, {
        cwd: workingDir,
        shell: isWindows,
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      process.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      process.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      // 设置超时
      const timeout = setTimeout(() => {
        this.logger.error(`命令执行超时（${timeoutSeconds}秒），强制终止进程`);
        process.kill("SIGKILL");
        resolve(false);
      }, timeoutSeconds * 1000);

      process.on("close", (code) => {
        clearTimeout(timeout);

        if (code === 0) {
          this.logger.log(`命令执行成功: ${actualCommand} ${args.join(" ")}`);
          resolve(true);
        } else {
          this.logger.error(`命令执行失败，退出码: ${code}`);
          if (stderr) {
            this.logger.error(`错误输出: ${stderr}`);
          }
          resolve(false);
        }
      });

      process.on("error", (error) => {
        clearTimeout(timeout);
        this.logger.error(`执行命令失败: ${error.message}`);
        resolve(false);
      });
    });
  }
}
