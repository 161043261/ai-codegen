package com.github.tianchenghang.core.handler;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.github.tianchenghang.ai.model.message.*;
import com.github.tianchenghang.ai.tools.ToolManager;
import com.github.tianchenghang.model.entity.User;
import com.github.tianchenghang.model.enums.ChatHistoryMessageType;
import com.github.tianchenghang.service.ChatHistoryService;
import jakarta.annotation.Resource;
import java.util.HashSet;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

@Slf4j
@Component
public class JsonMessageStreamHandler {
  @Resource private ToolManager toolManager;

  public Flux<String> handle(
      Flux<String> originalFlux,
      ChatHistoryService chatHistoryService,
      long appId,
      User loginUser) {
    var charHistoryStringBuilder = new StringBuilder();
    var executedToolIds = new HashSet<String>();
    return originalFlux
        .map(
            chuck -> {
              return handleJsonMessageChunk(chuck, charHistoryStringBuilder, executedToolIds);
            })
        .filter(StrUtil::isNotEmpty)
        .doOnComplete(
            () -> {
              var aiResponse = charHistoryStringBuilder.toString();
              chatHistoryService.addChatMessage(
                  appId, aiResponse, ChatHistoryMessageType.AI.getValue(), loginUser.getId());
            })
        .doOnError(
            error -> {
              var errorMessage = "AI 响应失败: " + error.getMessage();
              chatHistoryService.addChatMessage(
                  appId, errorMessage, ChatHistoryMessageType.AI.getValue(), loginUser.getId());
            });
  }

  private String handleJsonMessageChunk(
      String chunk, StringBuilder chatHistoryStringBuilder, Set<String> calledToolIds) {
    var streamMessage = JSONUtil.toBean(chunk, StreamMessage.class);
    var streamMessageType = StreamMessageType.getEnumByValue(streamMessage.getType());
    if (streamMessageType == null) {
      log.error("消息类型为空");
      return "";
    }
    switch (streamMessageType) {
      case AI_RESPONSE -> {
        var aiMessage = JSONUtil.toBean(chunk, AiResponseMessage.class);
        var data = aiMessage.getData();
        chatHistoryStringBuilder.append(data);
        return data;
      }
      case TOOL_REQUEST -> {
        var toolRequestMessage = JSONUtil.toBean(chunk, ToolRequestMessage.class);
        var toolId = toolRequestMessage.getId();
        var toolName = toolRequestMessage.getName();
        if (toolId != null && !calledToolIds.contains(toolId)) {
          calledToolIds.add(toolId);
          var tool = toolManager.getTool(toolName);
          return tool.generateToolResponse();
        } else {
          return "";
        }
      }
      case TOOL_EXECUTE_RESULT -> {
        var toolExecuteMessage = JSONUtil.toBean(chunk, ToolExecuteMessage.class);
        var jsonObj = JSONUtil.parseObj(toolExecuteMessage.getArguments());
        var toolName = toolExecuteMessage.getName();
        var tool = toolManager.getTool(toolName);
        var result = tool.generateToolExecuteResult(jsonObj);
        var output = String.format("\n\n%s\n\n", result);
        chatHistoryStringBuilder.append(result);
        return output;
      }
      default -> {
        log.error("不支持的消息类型: {}", streamMessageType);
        return "";
      }
    }
  }
}
