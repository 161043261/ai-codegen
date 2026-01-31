package com.github.tianchenghang.ai.tools;

import cn.hutool.json.JSONObject;

public abstract class BaseTool {
  public abstract String getToolName();

  public abstract String getDisplayName();

  public String generateToolResponse() {
    return String.format("\n\n使用工具: %s\n\n", getDisplayName());
  }

  public abstract String generateToolExecuteResult(JSONObject arguments);
}
