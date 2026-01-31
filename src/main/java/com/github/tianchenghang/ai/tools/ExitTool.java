package com.github.tianchenghang.ai.tools;

import cn.hutool.json.JSONObject;
import dev.langchain4j.agent.tool.Tool;
import org.springframework.stereotype.Component;

@Component
public class ExitTool extends BaseTool {

  @Override
  public String getToolName() {
    return "Exit";
  }

  @Override
  public String getDisplayName() {
    return "退出";
  }

  @Tool("当任务已完成, 或无需继续调用工具时, 使用此工具退出, 防止循环")
  public String exit() {
    return "不要继续调用工具, 可以输出结果";
  }

  @Override
  public String generateToolExecuteResult(JSONObject arguments) {
    return String.format("调用工具: %s", getDisplayName());
  }
}
