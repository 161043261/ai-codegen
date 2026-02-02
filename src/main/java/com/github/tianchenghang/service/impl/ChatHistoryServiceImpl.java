package com.github.tianchenghang.service.impl;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.github.tianchenghang.common.PageRequest;
import com.github.tianchenghang.constants.UserConstant;
import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import com.github.tianchenghang.mapper.ChatHistoryMapper;
import com.github.tianchenghang.model.dto.chat_history.ChatHistoryQueryRequest;
import com.github.tianchenghang.model.entity.ChatHistory;
import com.github.tianchenghang.model.entity.User;
import com.github.tianchenghang.model.enums.ChatHistoryMessageType;
import com.github.tianchenghang.service.AppService;
import com.github.tianchenghang.service.ChatHistoryService;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ChatHistoryServiceImpl extends ServiceImpl<ChatHistoryMapper, ChatHistory>
    implements ChatHistoryService {
  @Resource @Lazy private AppService appService;

  @Override
  public boolean addChatMessage(Long appId, String message, String messageType, Long userId) {
    if (appId == null || appId <= 0) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Invalid project ID");
    }
    if (StrUtil.isBlank(message)) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Message content is empty");
    }
    if (StrUtil.isBlank(messageType)) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Message type is empty");
    }
    if (userId == null || userId <= 0) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Invalid userId");
    }
    var messageTypeEnum = ChatHistoryMessageType.getEnumByValue(messageType);
    if (messageTypeEnum == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Unsupported message type");
    }
    var chatHistory =
        ChatHistory.builder()
            .appId(appId)
            .message(message)
            .messageType(messageType)
            .userId(userId)
            .build();
    return this.save(chatHistory);
  }

  @Override
  public boolean deleteByAppId(Long appId) {
    if (appId == null || appId <= 0) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Invalid project ID");
    }
    var queryWrapper = QueryWrapper.create().eq("app_id", appId);
    return this.remove(queryWrapper);
  }

  @Override
  public Page<ChatHistory> listAppChatHistoryByPage(
      Long appId, int pageSize, LocalDateTime lastCreateTime, User loginUser) {
    if (appId == null || appId <= 0) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Invalid project ID");
    }
    if (pageSize <= 0 || pageSize > 50) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Page size must be between 1 and 50");
    }
    if (loginUser == null) {
      throw new BusinessException(ErrorCode.UNAUTHORIZED, "User not logged in");
    }
    var appEntity = appService.getById(appId);
    if (appEntity == null) {
      throw new BusinessException(ErrorCode.NOT_FOUND, "Project not found");
    }
    var isAdmin = UserConstant.ADMIN_ROLE.equals(loginUser.getUserRole());
    var isCreator = appEntity.getUserId().equals(loginUser.getId());
    if (!isAdmin || !isCreator) {
      throw new BusinessException(ErrorCode.NO_PERMISSION, "No permission to view chat history");
    }
    var queryRequest = new ChatHistoryQueryRequest();
    queryRequest.setAppId(appId);
    queryRequest.setLastCreateTime(lastCreateTime);
    var queryWrapper = this.getQueryWrapper(queryRequest);
    return this.page(Page.of(1, pageSize), queryWrapper);
  }

  @Override
  public int loadChatHistory2memory(Long appId, MessageWindowChatMemory chatMemory, int maxCount) {
    try {
      var queryWrapper =
          QueryWrapper.create()
              .eq(ChatHistory::getAppId, appId)
              .orderBy(ChatHistory::getCreateTime, false)
              .limit(1, maxCount);
      var historyList = this.list(queryWrapper);
      if (CollUtil.isEmpty(historyList)) {
        return 0;
      }
      historyList = historyList.reversed();
      var loadedCount = 0;
      chatMemory.clear();
      for (var history : historyList) {
        if (ChatHistoryMessageType.USER.getValue().equals(history.getMessageType())) {
          chatMemory.add(UserMessage.from(history.getMessage()));
        } else if (ChatHistoryMessageType.AI.getValue().equals(history.getMessageType())) {
          chatMemory.add(AiMessage.from(history.getMessage()));
        }
        loadedCount++;
      }
      log.info("Project ID: {}, loaded {} historical messages successfully", appId, loadedCount);
      return loadedCount;
    } catch (Exception e) {
      log.error("Project ID: {}, failed to load historical messages: {}", appId, e.getMessage(), e);
      return 0;
    }
  }

  @Override
  public QueryWrapper getQueryWrapper(ChatHistoryQueryRequest chatHistoryQueryRequest) {
    var queryWrapper = QueryWrapper.create();
    if (chatHistoryQueryRequest == null) {
      return queryWrapper;
    }
    var id = chatHistoryQueryRequest.getId();
    var message = chatHistoryQueryRequest.getMessage();
    var messageType = chatHistoryQueryRequest.getMessageType();
    var appId = chatHistoryQueryRequest.getAppId();
    var userId = chatHistoryQueryRequest.getUserId();
    var lastCreateTime = chatHistoryQueryRequest.getLastCreateTime();
    var sortField = chatHistoryQueryRequest.getSortField();
    var sortOrder = chatHistoryQueryRequest.getSortOrder();
    queryWrapper
        .eq("id", id)
        .like("message", message)
        .eq("message_type", messageType)
        .eq("app_id", appId)
        .eq("user_id", userId);
    if (lastCreateTime != null) {
      queryWrapper.lt("create_time", lastCreateTime);
    }
    if (StrUtil.isNotBlank(sortField)) {
      queryWrapper.orderBy(sortField, PageRequest.SortOrder.ASC.equals(sortOrder));
    } else {
      queryWrapper.orderBy("create_time", false);
    }
    return queryWrapper;
  }
}
