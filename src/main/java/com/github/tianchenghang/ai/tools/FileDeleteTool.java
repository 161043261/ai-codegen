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
  @Tool("Delete file at the specified path")
  public String deleteFile(@P("Relative file path") String relativeFilepath, @ToolMemoryId Long appId) {
    try {
      var path = Paths.get(relativeFilepath);
      if (!path.isAbsolute()) {
        var projectDirname = "vite_project_" + appId;
        var projectRoot = Paths.get(AppConstant.CODE_OUTPUT_ROOT_DIR, projectDirname);
        path = projectRoot.resolve(relativeFilepath);
      }

      if (!Files.exists(path) || !Files.isRegularFile(path)) {
        return "File not found or not a file, cannot delete: " + relativeFilepath;
      }
      var filename = path.getFileName().toString();
      if (isImportantFile(filename)) {
        return "File deletion not allowed: " + relativeFilepath;
      }
      Files.delete(path);
      log.info("File deleted successfully: {}", path.toAbsolutePath());
      return "File deleted successfully: " + relativeFilepath;
    } catch (IOException e) {
      var errorMessage = String.format("File deletion failed: %s, error: %s", relativeFilepath, e.getMessage());
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
    return "File Delete";
  }

  @Override
  public String generateToolExecuteResult(JSONObject arguments) {
    var relativeFilepath = arguments.getStr("relativeFilepath");
    return String.format("Invoke tool: %s %s", getDisplayName(), relativeFilepath);
  }
}
