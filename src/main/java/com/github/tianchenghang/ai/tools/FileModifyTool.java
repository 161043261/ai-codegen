package com.github.tianchenghang.ai.tools;

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
      @P("文件的相对路径") String relativeFilepath,
      @P("修改前的旧内容") String oldContent,
      @P("修改后的新内容") String newContent,
      @ToolMemoryId Long appId) {
    try {
      var path = Paths.get(relativeFilepath);
      if (!path.isAbsolute()) {
        var projectDirname = "vite_project_" + appId;
        var projectRoot = Paths.get(AppConstant.CODE_OUTPUT_ROOT_DIR, projectDirname);
        path = projectRoot.resolve(relativeFilepath);
      }
      if (!Files.exists(path) || !Files.isRegularFile(path)) {
        return "文件不存在, 或不是文件: " + relativeFilepath;
      }
      var originalContent = Files.readString(path);
      if (!originalContent.contains(oldContent)) {
        return "文件未修改: " + relativeFilepath;
      }
      var modifiedContent = originalContent.replace(oldContent, newContent);
      if (originalContent.equals(modifiedContent)) {
        return "文件未修改: " + relativeFilepath;
      }
      Files.writeString(
          path, modifiedContent, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
      log.info("文件修改成功: {}", path.toAbsolutePath());
      return "文件修改成功: " + relativeFilepath;
    } catch (IOException e) {
      var errorMessage = String.format("文件修改失败: %s, 错误: %s", relativeFilepath, e.getMessage());
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
    return "文件修改";
  }

  @Override
  public String generateToolExecuteResult(JSONObject arguments) {
    var relativeFilepath = arguments.getStr("relativeFilepath");
    var oldContent = arguments.getStr("oldContent");
    var newContent = arguments.getStr("newContent");
    return String.format(
        """
      调用工具: %s %s;

      修改前:
      ```
      %s
      ```

      修改后
      ```
      %s
      ```
      """,
        getDisplayName(), relativeFilepath, oldContent, newContent);
  }
}
