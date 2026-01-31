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

  @Tool("读取指定路径的文件内容")
  public String readFile(@P("文件的相对路径") String relativeFilepath, @ToolMemoryId Long appId) {
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
      return Files.readString(path);
    } catch (IOException e) {
      var errorMessage = String.format("文件读取失败: %s, 错误: %s", relativeFilepath, e.getMessage());
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
    return "文件读取";
  }

  @Override
  public String generateToolExecuteResult(JSONObject arguments) {
    var relativeFilepath = arguments.getStr("relativeFilepath");
    return String.format("调用工具: %s %s", getDisplayName(), relativeFilepath);
  }
}
