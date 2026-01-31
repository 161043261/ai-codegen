package com.github.tianchenghang.ai.tools;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ToolManager {
  private final Map<String, BaseTool> toolkits = new HashMap<>();

  @Resource private BaseTool[] tools;

  @PostConstruct
  public void registerToolkits() {
    for (var tool : tools) {
      toolkits.put(tool.getToolName(), tool);
      log.info("注册工具: {} -> {}", tool.getToolName(), tool.getDisplayName());
    }
    log.info("工具注册完成, 注册 {} 个工具", toolkits.size());
  }

  public BaseTool getTool(String toolName) {
    return toolkits.get(toolName);
  }

  public BaseTool[] getAllTools() {
    return tools;
  }
}
