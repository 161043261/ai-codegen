package com.github.tianchenghang.controller;

import com.github.tianchenghang.annotation.AuthCheck;
import com.github.tianchenghang.common.BaseResponse;
import com.github.tianchenghang.common.ResultUtil;
import com.github.tianchenghang.constants.UserConstant;
import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import com.github.tianchenghang.model.dto.chat_history.ChatHistoryQueryRequest;
import com.github.tianchenghang.model.entity.ChatHistory;
import com.github.tianchenghang.service.ChatHistoryService;
import com.github.tianchenghang.service.UserService;
import com.mybatisflex.core.paginate.Page;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat-history")
public class ChatHistoryController {
  @Resource private ChatHistoryService chatHistoryService;

  @Resource private UserService userService;

  @GetMapping("/app/{appId}")
  public BaseResponse<Page<ChatHistory>> listAppChatHistory(
      @PathVariable Long appId,
      @RequestParam(defaultValue = "10") int pageSize,
      @RequestParam(required = false) LocalDateTime lastCreateTime,
      HttpServletRequest request) {
    var loginUser = userService.getLoginUser(request);
    var result =
        chatHistoryService.listAppChatHistoryByPage(appId, pageSize, lastCreateTime, loginUser);
    return ResultUtil.success(result);
  }

  @PostMapping("/admin/list/page/vo")
  @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
  public BaseResponse<Page<ChatHistory>> listAllChatHistoryByPageForAdmin(
      @RequestBody ChatHistoryQueryRequest chatHistoryQueryRequest) {
    if (chatHistoryQueryRequest == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var pageNum = chatHistoryQueryRequest.getPageNum();
    var pageSize = chatHistoryQueryRequest.getPageSize();
    var queryWrapper = chatHistoryService.getQueryWrapper(chatHistoryQueryRequest);
    var result = chatHistoryService.page(Page.of(pageNum, pageSize), queryWrapper);
    return ResultUtil.success(result);
  }
}
