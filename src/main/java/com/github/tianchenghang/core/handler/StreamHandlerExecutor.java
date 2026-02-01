package com.github.tianchenghang.core.handler;

import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import com.github.tianchenghang.model.entity.User;
import com.github.tianchenghang.model.enums.CodegenType;
import com.github.tianchenghang.service.ChatHistoryService;
import jakarta.annotation.Resource;
import reactor.core.publisher.Flux;

public class StreamHandlerExecutor {

  @Resource private JsonMessageStreamHandler jsonMessageStreamHandler;

  public Flux<String> handle(
      Flux<String> originalFlux,
      ChatHistoryService chatHistoryService,
      long appId,
      User loginUser,
      CodegenType codegenType) {
    return switch (codegenType) {
      case VITE_PROJECT -> {
        yield jsonMessageStreamHandler.handle(originalFlux, chatHistoryService, appId, loginUser);
      }
      case VANILLA_HTML, MULTI_FILES -> {
        yield new SimpleTextStreamHandler()
            .handle(originalFlux, chatHistoryService, appId, loginUser);
      }
      default -> {
        throw new BusinessException(
            ErrorCode.INTERNAL_SERVER_ERROR, "不支持的代码生成类型: " + codegenType.getValue());
      }
    };
  }
}
