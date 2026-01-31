package com.github.tianchenghang.ai;

import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.store.memory.chat.ChatMemoryStore;
import jakarta.annotation.Resource;

public class AiCodegenServiceFactory {

  @Resource(name = "openAiChatModel")
  private ChatModel chatModel;

  @Resource private ChatMemoryStore chatMemoryStore;

  @Resource private ChatHistoryService chatHistoryService;
}
