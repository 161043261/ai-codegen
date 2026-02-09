package com.github.tianchenghang.ai.tools;

import cn.hutool.core.io.FileUtil;
import cn.hutool.json.JSONObject;
import com.github.tianchenghang.constants.AppConstant;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.agent.tool.ToolMemoryId;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class FileWriteTool extends BaseTool {

  @Tool("Write file to the specified path")
  public String writeFile(
      @P("Relative file path") String relativeFilepath,
      @P("File content to write") String content,
      @ToolMemoryId Long appId) {
    try {

      var path = Paths.get(relativeFilepath);
      if (!path.isAbsolute()) {
        var projectDirname = "vite_project_" + appId;
        var projectRoot = Paths.get(AppConstant.CODE_OUTPUT_ROOT_DIR, projectDirname);
        path = projectRoot.resolve(relativeFilepath);
      }
      var parentDir = path.getParent();
      if (parentDir != null) {
        Files.createDirectories(parentDir);
      }
      Files.write(
          path,
          content.getBytes(),
          StandardOpenOption.CREATE,
          StandardOpenOption.TRUNCATE_EXISTING);
      log.info("File written successfully: {}", path.toAbsolutePath());
      return "File written successfully: " + relativeFilepath;
    } catch (IOException e) {
      var errorMessage =
          String.format("File write failed: %s, error: %s", relativeFilepath, e.getMessage());
      log.error(errorMessage, e);
      return errorMessage;
    }
  }

  @Override
  public String getToolName() {
    return "FileWrite";
  }

  @Override
  public String getDisplayName() {
    return "File Write";
  }

  @Override
  public String generateToolExecuteResult(JSONObject arguments) {
    var relativeFilepath = arguments.getStr("relativeFilepath");
    var suffix = FileUtil.getSuffix(relativeFilepath);
    var content = arguments.getStr("content");

    return String.format(
        """
      Invoke tool: %s %s;
      ```%s
      %s
      ```
      """,
        getDisplayName(), relativeFilepath, suffix, content);
  }
}
