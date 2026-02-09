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
      log.info("Registering tool: {} -> {}", tool.getToolName(), tool.getDisplayName());
    }
    log.info("Tool registration completed, total {} tools", toolkits.size());
  }

  public BaseTool getTool(String toolName) {
    return toolkits.get(toolName);
  }

  public BaseTool[] getAllTools() {
    return tools;
  }
}
