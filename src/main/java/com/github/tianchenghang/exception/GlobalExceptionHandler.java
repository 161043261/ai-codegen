package com.github.tianchenghang.exception;

import static org.slf4j.LoggerFactory.getLogger;

import cn.hutool.json.JSONUtil;
import com.github.tianchenghang.common.BaseResponse;
import com.github.tianchenghang.common.ResultUtil;
import java.io.IOException;
import java.util.Map;
import org.slf4j.Logger;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@RestControllerAdvice
public class GlobalExceptionHandler {
  private static final Logger logger = getLogger(GlobalExceptionHandler.class);

  public BaseResponse<?> businessExceptionHandler(BusinessException e) {
    logger.error("business exception:", e);
    if (handleSseError(e.getCode(), e.getMessage())) {
      return null;
    }
    return ResultUtil.error(e.getCode(), e.getMessage());
  }

  // event: business-error
  // data: {...}

  // event: done
  // data: {}
  private boolean handleSseError(int errorCode, String errorMessage) {
    var attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
    if (attributes == null) {
      return false;
    }
    var request = attributes.getRequest();
    var response = attributes.getResponse();
    var accept = request.getHeader("Accept");
    var uri = request.getRequestURI();
    if (response != null
        && ((accept != null && accept.contains("text/event-stream"))
            || uri.contains("/chat/codegen"))) {
      try {
        response.setContentType("text/event-stream");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Cache-Control", "no-cache");
        response.setHeader("Connection", "keep-alive");

        var errorData = Map.of("error", true, "code", errorCode, "message", errorMessage);
        var errorJson = JSONUtil.toJsonStr(errorData);
        var sseData = String.format("event: business-error\ndata: %s\n\n", errorJson);

        response.getWriter().write(sseData);
        response.getWriter().flush();
        response.getWriter().write("event: done\ndata: {}\n\n");
        response.getWriter().flush();
        return true;
      } catch (IOException e) {
        logger.error("Failed to write SSE error response:", e);
        return true;
      }
    }
    return false;
  }
}
