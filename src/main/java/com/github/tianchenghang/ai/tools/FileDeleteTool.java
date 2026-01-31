package com.github.tianchenghang.ai.tools;

import cn.hutool.json.JSONObject;
import com.github.tianchenghang.constants.AppConstant;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.agent.tool.ToolMemoryId;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class FileDeleteTool extends BaseTool {
  @Tool("删除指定路径的文件")
  public String deleteFile(@P("文件的相对路径") String relativeFilepath, @ToolMemoryId Long appId) {
    try {
      var path = Paths.get(relativeFilepath);
      if (!path.isAbsolute()) {
        var projectDirname = "vite_project_" + appId;
        var projectRoot = Paths.get(AppConstant.CODE_OUTPUT_ROOT_DIR, projectDirname);
        path = projectRoot.resolve(relativeFilepath);
      }

      if (!Files.exists(path)) {
        return "文件不存在, 无需删除: " + relativeFilepath;
      }
      if (!Files.isRegularFile(path)) {
        return "不是文件, 无法删除: " + relativeFilepath;
      }
      var filename = path.getFileName().toString();
      if (isImportantFile(filename)) {
        return "文件不允许删除: " + relativeFilepath;
      }
      Files.delete(path);
      log.info("文件删除成功: {}", path.toAbsolutePath());
      return "文件删除成功: " + relativeFilepath;
    } catch (IOException e) {
      var errorMessage = String.format("文件删除失败: %s, 错误: %s", relativeFilepath, e.getMessage());
      log.error(errorMessage, e);
      return errorMessage;
    }
  }

  private boolean isImportantFile(String filename) {
    var importantFiles =
        new String[] {
          "package.json",
          "package-lock.json",
          "yarn.lock",
          "pnpm-lock.yaml",
          "vite.config.js",
          "vite.config.ts",
          "tsconfig.json",
          "tsconfig.app.json",
          "tsconfig.node.json",
          "index.html",
          "main.js",
          "main.ts",
          "App.tsx",
          "App.vue",
          ".gitignore",
          "README.md"
        };
    for (var file : importantFiles) {
      if (file.equalsIgnoreCase(filename)) {
        return true;
      }
    }
    return false;
  }

  @Override
  public String getToolName() {
    return "FileDelete";
  }

  @Override
  public String getDisplayName() {
    return "文件删除";
  }

  @Override
  public String generateToolExecuteResult(JSONObject arguments) {
    var relativeFilepath = arguments.getStr("relativeFilepath");
    return String.format("调用工具: %s %s", getDisplayName(), relativeFilepath);
  }
}
