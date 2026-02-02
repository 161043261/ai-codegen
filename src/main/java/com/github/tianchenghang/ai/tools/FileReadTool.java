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
public class FileReadTool extends BaseTool {

  @Tool("Read file content from the specified path")
  public String readFile(@P("Relative file path") String relativeFilepath, @ToolMemoryId Long appId) {
    try {
      var path = Paths.get(relativeFilepath);
      if (!path.isAbsolute()) {
        var projectDirname = "vite_project_" + appId;
        var projectRoot = Paths.get(AppConstant.CODE_OUTPUT_ROOT_DIR, projectDirname);
        path = projectRoot.resolve(relativeFilepath);
      }
      if (!Files.exists(path) || !Files.isRegularFile(path)) {
        return "File not found or not a file: " + relativeFilepath;
      }
      return Files.readString(path);
    } catch (IOException e) {
      var errorMessage = String.format("File read failed: %s, error: %s", relativeFilepath, e.getMessage());
      log.error(errorMessage, e);
      return errorMessage;
    }
  }

  @Override
  public String getToolName() {
    return "FileRead";
  }

  @Override
  public String getDisplayName() {
    return "File Read";
  }

  @Override
  public String generateToolExecuteResult(JSONObject arguments) {
    var relativeFilepath = arguments.getStr("relativeFilepath");
    return String.format("Invoke tool: %s %s", getDisplayName(), relativeFilepath);
  }
}
