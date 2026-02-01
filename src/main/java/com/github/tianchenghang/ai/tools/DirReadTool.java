package com.github.tianchenghang.ai.tools;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONObject;
import com.github.tianchenghang.constants.AppConstant;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.agent.tool.ToolMemoryId;
import java.io.File;
import java.nio.file.Paths;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DirReadTool extends BaseTool {

  private static final Set<String> IGNORED_NAMES =
      Set.of(
          ".git",
          ".idea",
          ".mvn",
          ".vite",
          ".vscode",
          "build",
          "coverage",
          "dist",
          "node_modules",
          "target",
          ".DS_Store",
          ".env");

  private static final Set<String> IGNORED_EXTENSIONS = Set.of(".cache", ".lock", ".log", ".tmp");

  @Tool("读取指定路径的目录, 获取指定目录下所有文件和子目录")
  public String readDir(
      @P("目录的相对路径, 如果为空则是项目根目录") String relativeDirpath, @ToolMemoryId Long appId) {
    try {
      var path = Paths.get(relativeDirpath == null ? "" : relativeDirpath);
      if (!path.isAbsolute()) {
        var projectDirname = "vite_project_" + appId;
        var projectRoot = Paths.get(AppConstant.CODE_OUTPUT_ROOT_DIR, projectDirname);
        path = projectRoot.resolve(relativeDirpath == null ? "" : relativeDirpath);
      }
      var targetDir = path.toFile();
      if (!targetDir.exists() || !targetDir.isDirectory()) {
        return "目录不存在, 或不是目录: " + relativeDirpath;
      }
      var dirStructureBuilder = new StringBuilder();
      dirStructureBuilder.append("目录结构:\n");
      var allFiles = FileUtil.loopFiles(targetDir, file -> !shouldIgnore(file.getName()));
      allFiles.stream()
          .sorted(
              (f1, f2) -> {
                int depth1 = getRelativeDepth(targetDir, f1);
                int depth2 = getRelativeDepth(targetDir, f2);
                if (depth1 != depth2) {
                  return Integer.compare(depth1, depth2);
                }
                return f1.getPath().compareTo(f2.getPath());
              })
          .forEach(
              file -> {
                int depth = getRelativeDepth(targetDir, file);
                String indent = "  ".repeat(depth);
                dirStructureBuilder.append(indent).append(file.getName());
              });
      return dirStructureBuilder.toString();
    } catch (Exception e) {
      var errorMessage = String.format("读取目录失败: %s, 错误: %s", relativeDirpath, e.getMessage());
      log.error(errorMessage, e);
      return errorMessage;
    }
  }

  private boolean shouldIgnore(String filename) {
    if (IGNORED_NAMES.contains(filename)) {
      return true;
    }
    return IGNORED_EXTENSIONS.stream().anyMatch(filename::endsWith);
  }

  private int getRelativeDepth(File root, File file) {
    var rootPath = root.toPath();
    var filePath = file.toPath();
    return rootPath.relativize(filePath).getNameCount() - 1;
  }

  @Override
  public String getToolName() {
    return "ReadDir";
  }

  @Override
  public String getDisplayName() {
    return "读取目录";
  }

  @Override
  public String generateToolExecuteResult(JSONObject arguments) {
    var relativeDirpath = arguments.getStr("relativeDirpath");
    if (StrUtil.isEmpty(relativeDirpath)) {
      relativeDirpath = "项目根目录";
    }
    return String.format("调用工具: %s %s", getDisplayName(), relativeDirpath);
  }
}
