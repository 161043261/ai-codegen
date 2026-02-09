package com.github.tianchenghang.ai.tools;

import cn.hutool.json.JSONObject;

public abstract class BaseTool {
  public abstract String getToolName();

  public abstract String getDisplayName();

  public String generateToolResponse() {
    return String.format("\n\nUsing tool: %s\n\n", getDisplayName());
  }

  public abstract String generateToolExecuteResult(JSONObject arguments);
}
