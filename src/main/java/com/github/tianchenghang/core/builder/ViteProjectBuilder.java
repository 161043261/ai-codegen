package com.github.tianchenghang.core.builder;

import cn.hutool.core.util.RuntimeUtil;
import java.io.File;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ViteProjectBuilder {

  public void buildProjectAsync(String projectPath) {
    Thread.ofVirtual()
        .name("vite-builder-" + System.currentTimeMillis())
        .start(
            () -> {
              try {
                buildProject(projectPath);
              } catch (Exception e) {
                log.error("Async Vite project build exception: {}", e.getMessage(), e);
              }
            });
  }

  public boolean buildProject(String projectPath) {
    var projectDir = new File(projectPath);
    if (!projectDir.exists() || !projectDir.isDirectory()) {
      log.error("Project directory not found or not a directory: {}", projectPath);
      return false;
    }
    var packageJsonFile = new File(projectDir, "package.json");
    if (!packageJsonFile.exists()) {
      log.error("No package.json found in project directory: {}", projectPath);
      return false;
    }
    log.info("Starting Vite project build: {}", projectPath);
    if (!executeNpmInstall(projectDir)) {
      log.error("npm install failed: {}", projectPath);
      return false;
    }
    if (!executeNpmBuild(projectDir)) {
      log.error("npm run build failed: {}", projectPath);
      return false;
    }
    log.info("Vite project built successfully, dist directory: {}", projectPath);
    return true;
  }

  private boolean executeNpmInstall(File projectDir) {
    log.info("Executing npm install...");
    var command = String.format("%s install", buildCommand("npm"));
    return executeCommand(projectDir, command, 300); // 5min timeout
  }

  private boolean executeNpmBuild(File projectDir) {
    log.info("Executing npm run build...");
    var command = String.format("%s run builder", buildCommand("npm"));
    return executeCommand(projectDir, command, 300); // 5min timeout
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
      log.info("Working directory: {}, executing command: {}", workDir.getAbsolutePath(), command);
      var process = RuntimeUtil.exec(null, workDir, command.split("\\s+"));
      var finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
      if (!finished) {
        log.error("Command {} timed out after {}s, force terminating", command, timeoutSeconds);
        process.destroyForcibly();
        return false;
      }
      var exitCode = process.exitValue();
      if (exitCode == 0) {
        log.info("Command {} executed successfully", command);
        return true;
      }
      log.error("Command {} failed with exit code: {}", command, exitCode);
      return false;
    } catch (Exception e) {
      log.error("Command {} failed with error: {}", command, e.getMessage(), e);
      return false;
    }
  }
}
