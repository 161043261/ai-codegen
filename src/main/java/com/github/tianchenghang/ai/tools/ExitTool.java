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
    return "Exit";
  }

  @Tool("Use this tool to exit when task is completed or no more tools needed, preventing loops")
  public String exit() {
    return "Do not continue calling tools, output result";
  }

  @Override
  public String generateToolExecuteResult(JSONObject arguments) {
    return String.format("Invoke tool: %s", getDisplayName());
  }
}
