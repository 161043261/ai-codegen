package com.github.tianchenghang.core.handler;

import com.github.tianchenghang.model.entity.User;
import com.github.tianchenghang.model.enums.ChatHistoryMessageType;
import com.github.tianchenghang.service.ChatHistoryService;
import reactor.core.publisher.Flux;

public class SimpleTextStreamHandler {
  public Flux<String> handle(
      Flux<String> originalFlux,
      ChatHistoryService chatHistoryService,
      long appId,
      User loginUser) {
    var aiResponseStringBuilder = new StringBuilder();
    return originalFlux
        .map(
            chunk -> {
              aiResponseStringBuilder.append(chunk);
              return chunk;
            })
        .doOnComplete(
            () -> {
              var aiResponse = aiResponseStringBuilder.toString();
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
}
