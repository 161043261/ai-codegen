package com.github.tianchenghang.core.build;

import cn.hutool.core.util.RuntimeUtil;
import java.io.File;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ViteProjectBuilder {

  public void buildProjectAsync(String projectPath) {
    Thread.ofVirtual()
        .name("vite-builder-" + System.currentTimeMillis())
        .start(
            () -> {
              try {
                buildProject(projectPath);
              } catch (Exception e) {
                log.error("异步构建 Vite 项目异常: {}", e.getMessage(), e);
              }
            });
  }

  public boolean buildProject(String projectPath) {
    var projectDir = new File(projectPath);
    if (!projectDir.exists() || !projectDir.isDirectory()) {
      log.error("项目目录不存在, 或不是目录: {}", projectPath);
      return false;
    }
    var packageJsonFile = new File(projectDir, "package.json");
    if (!packageJsonFile.exists()) {
      log.error("项目目录中没有 package.json: {}", projectPath);
      return false;
    }
    log.info("开始构建 Vite 项目: {}", projectPath);
    if (!executeNpmInstall(projectDir)) {
      log.error("npm install 失败: {}", projectPath);
      return false;
    }
    if (!executeNpmBuild(projectDir)) {
      log.error("npm run build 失败: {}", projectPath);
      return false;
    }
    log.info("Vite 项目构建成功, dist 目录: {}", projectPath);
    return true;
  }

  private boolean executeNpmInstall(File projectDir) {
    log.info("执行 npm install...");
    var command = String.format("%s install", buildCommand("npm"));
    return executeCommand(projectDir, command, 300); // 5min 超时
  }

  private boolean executeNpmBuild(File projectDir) {
    log.info("执行 npm run build...");
    var command = String.format("%s run build", buildCommand("npm"));
    return executeCommand(projectDir, command, 300); // 5min 超时
  }

  private String buildCommand(String baseCommand) {
    if (isWindows()) {
      return baseCommand + ".cmd";
    }
    return baseCommand;
  }

  private boolean isWindows() {
    return System.getProperty("os.name").toLowerCase().contains("windows");
  }

  private boolean executeCommand(File workDir, String command, int timeoutSeconds) {
    try {
      log.info("工作目录: {}, 执行命令: {}", workDir.getAbsolutePath(), command);
      var process = RuntimeUtil.exec(null, workDir, command.split("\\s+"));
      var finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
      if (!finished) {
        log.error("执行 {} 命令超时 {}s, 强制终止", command, timeoutSeconds);
        process.destroyForcibly();
        return false;
      }
      var exitCode = process.exitValue();
      if (exitCode == 0) {
        log.info("命令 {} 执行成功", command);
        return true;
      }
      log.error("命令 {} 执行失败, 退出码: {}", command, exitCode);
      return false;
    } catch (Exception e) {
      log.error("命令 {} 执行失败, 错误信息: {}", command, e.getMessage(), e);
      return false;
    }
  }
}
