package com.github.tianchenghang.service.impl;

import cn.hutool.core.util.StrUtil;
import cn.hutool.core.util.ZipUtil;
import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import com.github.tianchenghang.service.ProjectDownloadService;
import jakarta.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ProjectDownloadServiceImpl implements ProjectDownloadService {
  private static final Set<String> IGNORED_NAMES =
      Set.of(
          ".DS_Store",
          ".env",
          ".git",
          ".idea",
          ".mvn",
          ".vscode",
          "build",
          "dist",
          "node_modules",
          "target");

  private static final Set<String> IGNORED_EXTENSIONS = Set.of(".cache", ".log", ".tmp");

  @Override
  public void downloadProjectAsZip(
      String projectPath, String downloadFileName, HttpServletResponse response) {
    if (StrUtil.isBlank(projectPath)) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "项目路径为空");
    }
    if (StrUtil.isBlank(downloadFileName)) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "下载文件名为空");
    }
    var projectDir = new File(projectPath);
    if (!projectDir.exists()) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "项目路径不存在");
    }
    if (!projectDir.isDirectory()) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "项目路径不是目录");
    }
    log.info("开始压缩项目目录: {} -> {}.zip", projectPath, downloadFileName);
    response.setStatus(HttpServletResponse.SC_OK);
    response.setContentType("application/zip");
    response.addHeader(
        "Content-Disposition", String.format("attachment; filename=\"%s.zip\"", downloadFileName));
    FileFilter filter = file -> isPathAllowed(projectDir.toPath(), file.toPath());
    try {
      ZipUtil.zip(response.getOutputStream(), StandardCharsets.UTF_8, false, filter, projectDir);
      log.info("压缩项目目录成功: {} -> {}.zip", projectPath, downloadFileName);
    } catch (IOException e) {
      log.error("压缩项目目录失败: {}", e.getMessage(), e);
    }
  }

  private boolean isPathAllowed(Path projectRoot, Path fullPath) {
    var relativePath = projectRoot.relativize(fullPath);
    for (var part : relativePath) {
      var partName = part.toString();
      if (IGNORED_NAMES.contains(partName)) {
        return false;
      }
      if (IGNORED_EXTENSIONS.stream().anyMatch(ext -> partName.toLowerCase().endsWith(ext))) {
        return false;
      }
    }
    return true;
  }
}
