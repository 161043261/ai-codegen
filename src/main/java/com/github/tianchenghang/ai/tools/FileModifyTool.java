package com.github.tianchenghang.ai.tools;

import cn.hutool.core.io.FileUtil;
import cn.hutool.json.JSONObject;
import com.github.tianchenghang.constants.AppConstant;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.ToolMemoryId;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class FileModifyTool extends BaseTool {

  public String modifyFile(
      @P("Relative file path") String relativeFilepath,
      @P("Old content before modification") String oldContent,
      @P("New content after modification") String newContent,
      @ToolMemoryId Long appId) {
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
      var originalContent = Files.readString(path);
      if (!originalContent.contains(oldContent)) {
        return "File not modified: " + relativeFilepath;
      }
      var modifiedContent = originalContent.replace(oldContent, newContent);
      if (originalContent.equals(modifiedContent)) {
        return "File not modified: " + relativeFilepath;
      }
      Files.writeString(
          path, modifiedContent, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
      log.info("File modified successfully: {}", path.toAbsolutePath());
      return "File modified successfully: " + relativeFilepath;
    } catch (IOException e) {
      var errorMessage =
          String.format(
              "File modification failed: %s, error: %s", relativeFilepath, e.getMessage());
      log.error(errorMessage, e);
      return errorMessage;
    }
  }

  @Override
  public String getToolName() {
    return "FileModify";
  }

  @Override
  public String getDisplayName() {
    return "File Modify";
  }

  @Override
  public String generateToolExecuteResult(JSONObject arguments) {
    var relativeFilepath = arguments.getStr("relativeFilepath");
    var suffix = FileUtil.getSuffix(relativeFilepath);
    var oldContent = arguments.getStr("oldContent");
    var newContent = arguments.getStr("newContent");
    return String.format(
        """
        Invoke tool: %s %s;

        Before:
        ```%s
        %s
        ```

        After:
        ```%s
        %s
        ```
        """,
        getDisplayName(), relativeFilepath, suffix, oldContent, suffix, newContent);
  }
}
