package com.github.tianchenghang.service;

import com.github.tianchenghang.model.dto.chat_history.ChatHistoryQueryRequest;
import com.github.tianchenghang.model.entity.ChatHistory;
import com.github.tianchenghang.model.entity.User;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.service.IService;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import java.time.LocalDateTime;

public interface ChatHistoryService extends IService<ChatHistory> {
  boolean addChatMessage(Long appId, String message, String messageType, Long userId);

  boolean deleteByAppId(Long appId);

  Page<ChatHistory> listAppChatHistoryByPage(
      Long appId, int pageSize, LocalDateTime lastCreateTime, User loginUser);

  int loadChatHistory2memory(Long appId, MessageWindowChatMemory chatMemory, int maxCount);

  QueryWrapper getQueryWrapper(ChatHistoryQueryRequest chatHistoryQueryRequest);
}
