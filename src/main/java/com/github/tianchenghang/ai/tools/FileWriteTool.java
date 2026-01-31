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

  @Tool("写入文件到指定的路径")
  public String writeFile(
      @P("文件的相对路径") String relativeFilepath,
      @P("写入文件的内容") String content,
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
      log.info("文件写入成功: {}", path.toAbsolutePath());
      return "文件写入成功: " + relativeFilepath;
    } catch (IOException e) {
      var errorMessage = String.format("文件写入失败: %s, 错误: %s", relativeFilepath, e.getMessage());
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
    return "文件写入";
  }

  @Override
  public String generateToolExecuteResult(JSONObject arguments) {
    var relativeFilepath = arguments.getStr("relativeFilepath");
    var suffix = FileUtil.getSuffix(relativeFilepath);
    var content = arguments.getStr("content");

    return String.format(
        """
      调用工具: %s %s;
      ```%s
      %s
      ```
      """,
        getDisplayName(), relativeFilepath, suffix, content);
  }
}
