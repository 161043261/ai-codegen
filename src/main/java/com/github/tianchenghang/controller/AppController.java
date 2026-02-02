package com.github.tianchenghang.controller;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.github.tianchenghang.annotation.AuthCheck;
import com.github.tianchenghang.common.BaseResponse;
import com.github.tianchenghang.common.DeleteRequest;
import com.github.tianchenghang.common.ResultUtil;
import com.github.tianchenghang.constants.AppConstant;
import com.github.tianchenghang.constants.UserConstant;
import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import com.github.tianchenghang.model.dto.app.*;
import com.github.tianchenghang.model.entity.AppEntity;
import com.github.tianchenghang.model.vo.AppVo;
import com.github.tianchenghang.rate_limiter.annotation.RateLimit;
import com.github.tianchenghang.rate_limiter.enums.RateLimitType;
import com.github.tianchenghang.service.AppService;
import com.github.tianchenghang.service.ProjectDownloadService;
import com.github.tianchenghang.service.UserService;
import com.mybatisflex.core.paginate.Page;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.File;
import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/app")
public class AppController {
  private static final String SSE_DONE = "done";

  @Resource private AppService appService;

  @Resource private UserService userService;

  @Resource private ProjectDownloadService projectDownloadService;

  @GetMapping(value = "/chat/codegen", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  @RateLimit(limitType = RateLimitType.USER, rate = 5, rateInterval = 60, message = "AI chat request rate limit exceeded")
  public Flux<ServerSentEvent<String>> chatForCodegen(
      @RequestParam Long appId, @RequestParam String message, HttpServletRequest request) {
    if (appId == null || appId <= 0) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Invalid project ID");
    }
    if (StrUtil.isBlank(message)) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Prompt is empty");
    }
    var loginUser = userService.getLoginUser(request);
    var contentFlux = appService.chat2codegen(appId, message, loginUser);
    return contentFlux
        .map(
            chunk -> {
              var wrapper = Map.of("d", chunk);
              var jsonData = JSONUtil.toJsonStr(wrapper);
              return ServerSentEvent.<String>builder().data(jsonData).build();
            })
        .concatWith(
            Mono.just(
                ServerSentEvent.<String>builder().event(AppController.SSE_DONE).data("").build()));
  }

  @PostMapping("/deploy")
  public BaseResponse<String> deployApp(
      @RequestBody AppDeployRequest appDeployRequest, HttpServletRequest request) {
    if (appDeployRequest == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var appId = appDeployRequest.getAppId();
    if (appId == null || appId <= 0) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Invalid project ID");
    }
    var loginUser = userService.getLoginUser(request);
    var deployUrl = appService.deployApp(appId, loginUser);
    return ResultUtil.success(deployUrl);
  }

  @GetMapping("/download/{appId}")
  public void downloadApp(
      @PathVariable Long appId, HttpServletRequest request, HttpServletResponse response) {
    if (appId == null || appId <= 0) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Invalid project ID");
    }
    var appEntity = appService.getById(appId);
    if (appEntity == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Project not found");
    }
    var loginUser = userService.getLoginUser(request);
    if (!appEntity.getUserId().equals(loginUser.getId())) {
      throw new BusinessException(ErrorCode.NO_PERMISSION, "No download permission");
    }
    var codegenType = appEntity.getCodegenType();
    var sourceDirname = codegenType + "_" + appId;
    var sourceDirpath = AppConstant.CODE_OUTPUT_ROOT_DIR + File.separator + sourceDirname;
    var sourceDir = new File(sourceDirpath);
    if (!sourceDir.exists() || !sourceDir.isDirectory()) {
      throw new BusinessException(ErrorCode.NOT_FOUND, "Project not found");
    }
    var downloadFilename = String.valueOf(appId);
    projectDownloadService.downloadProjectAsZip(sourceDirpath, downloadFilename, response);
  }

  @PostMapping("/add")
  public BaseResponse<Long> addApp(
      @RequestBody AppAddRequest appAddRequest, HttpServletRequest request) {
    if (appAddRequest == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var loginUser = userService.getLoginUser(request);
    var appId = appService.createApp(appAddRequest, loginUser);
    return ResultUtil.success(appId);
  }

  @PostMapping("/update")
  public BaseResponse<Boolean> updateApp(
      @RequestBody AppUpdateRequest appUpdateRequest, HttpServletRequest request) {
    if (appUpdateRequest == null || appUpdateRequest.getId() == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var loginUser = userService.getLoginUser(request);
    long id = appUpdateRequest.getId();
    var oldAppEntity = appService.getById(id);
    if (oldAppEntity == null) {
      throw new BusinessException(ErrorCode.NOT_FOUND);
    }
    if (!oldAppEntity.getUserId().equals(loginUser.getId())) {
      throw new BusinessException(ErrorCode.NO_PERMISSION);
    }
    var appEntity = new AppEntity();
    appEntity.setId(id);
    appEntity.setAppName(appUpdateRequest.getAppName());
    appEntity.setEditTime(LocalDateTime.now());
    var result = appService.updateById(oldAppEntity);
    if (!result) {
      throw new BusinessException(ErrorCode.OPERATION_FAILED);
    }
    return ResultUtil.success(true);
  }

  @PostMapping("/delete")
  public BaseResponse<Boolean> deleteApp(
      @RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
    if (deleteRequest == null || deleteRequest.getId() <= 0) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var loginUser = userService.getLoginUser(request);
    var id = deleteRequest.getId();
    var oldAppEntity = appService.getById(id);
    if (oldAppEntity == null) {
      throw new BusinessException(ErrorCode.NOT_FOUND);
    }
    if (!oldAppEntity.getUserId().equals(loginUser.getId())
        && !UserConstant.ADMIN_ROLE.equals(loginUser.getUserRole())) {
      throw new BusinessException(ErrorCode.NO_PERMISSION);
    }
    var result = appService.removeById(id);
    return ResultUtil.success(result);
  }

  @GetMapping("/get/vo")
  public BaseResponse<AppVo> getAppVoById(long id) {
    if (id <= 0) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var appEntity = appService.getById(id);
    if (appEntity == null) {
      throw new BusinessException(ErrorCode.NOT_FOUND);
    }
    return ResultUtil.success(appService.getAppVo(appEntity));
  }

  @PostMapping("/my/list/page/vo")
  public BaseResponse<Page<AppVo>> getAppVoListByPage(
      @RequestBody AppQueryRequest appQueryRequest, HttpServletRequest request) {
    if (appQueryRequest == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var loginUser = userService.getLoginUser(request);
    var pageSize = appQueryRequest.getPageSize();
    if (pageSize > 20) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Maximum 20 apps per page");
    }
    var pageNum = appQueryRequest.getPageNum();
    appQueryRequest.setUserId(loginUser.getId());
    var queryWrapper = appService.getQueryWrapper(appQueryRequest);
    var appPage = appService.page(Page.of(pageNum, pageSize), queryWrapper);
    var appVoPage = new Page<AppVo>(pageNum, pageSize, appPage.getTotalRow());
    var appVoList = appService.getAppVoList(appPage.getRecords());
    appVoPage.setRecords(appVoList);
    return ResultUtil.success(appVoPage);
  }

  @PostMapping("/awesome/list/page/vo")
  @Cacheable(
      value = "awesome-apps",
      key = "T(com.github.tianchenghang.utils.CacheKeyUtil).generateKey(#appQueryRequest)",
      condition = "#appQueryRequest.pageNum <= 10")
  public BaseResponse<Page<AppVo>> getAwesomeAppVoListByPage(
      @RequestBody AppQueryRequest appQueryRequest) {
    if (appQueryRequest == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var pageSize = appQueryRequest.getPageSize();
    if (pageSize > 20) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Maximum 20 apps per page");
    }
    var pageNum = appQueryRequest.getPageNum();
    appQueryRequest.setPriority(AppConstant.AWESOME_APP_PRIORITY);
    var queryWrapper = appService.getQueryWrapper(appQueryRequest);
    var appPage = appService.page(Page.of(pageNum, pageSize), queryWrapper);
    var appVoPage = new Page<AppVo>(pageNum, pageSize, appPage.getTotalRow());
    var appVoList = appService.getAppVoList(appPage.getRecords());
    appVoPage.setRecords(appVoList);
    return ResultUtil.success(appVoPage);
  }

  @PostMapping("/admin/delete")
  @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
  public BaseResponse<Boolean> deleteAppByAdmin(@RequestBody DeleteRequest deleteRequest) {
    if (deleteRequest == null || deleteRequest.getId() <= 0) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var id = deleteRequest.getId();
    var oldAppEntity = appService.getById(id);
    if (oldAppEntity == null) {
      throw new BusinessException(ErrorCode.NOT_FOUND);
    }
    var result = appService.removeById(id);
    return ResultUtil.success(result);
  }

  @PostMapping("/admin/update")
  @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
  public BaseResponse<Boolean> updateAppByAdmin(
      @RequestBody AppAdminUpdateRequest appAdminUpdateRequest) {
    if (appAdminUpdateRequest == null || appAdminUpdateRequest.getId() == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var id = appAdminUpdateRequest.getId();
    var oldAppEntity = appService.getById(id);
    if (oldAppEntity == null) {
      throw new BusinessException(ErrorCode.NOT_FOUND);
    }
    var appEntity = new AppEntity();
    BeanUtil.copyProperties(appAdminUpdateRequest, appEntity);
    appEntity.setEditTime(LocalDateTime.now());
    var ok = appService.updateById(appEntity);
    if (!ok) {
      throw new BusinessException(ErrorCode.OPERATION_FAILED);
    }
    return ResultUtil.success(true);
  }

  @PostMapping("/admin/list/page/vo")
  @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
  public BaseResponse<Page<AppVo>> getAppVoListByPageByAdmin(
      @RequestBody AppQueryRequest appQueryRequest) {
    if (appQueryRequest == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var pageNum = appQueryRequest.getPageNum();
    var pageSize = appQueryRequest.getPageSize();
    var queryWrapper = appService.getQueryWrapper(appQueryRequest);
    var appPage = appService.page(Page.of(pageNum, pageSize), queryWrapper);
    var appVoPage = new Page<AppVo>(pageNum, pageSize, appPage.getTotalRow());
    var appVoList = appService.getAppVoList(appPage.getRecords());
    appVoPage.setRecords(appVoList);
    return ResultUtil.success(appVoPage);
  }

  @GetMapping("/admin/get/vo")
  @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
  public BaseResponse<AppVo> getAppVoByIdByAdmin(long id) {
    if (id <= 0) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var appEntity = appService.getById(id);
    if (appEntity == null) {
      throw new BusinessException(ErrorCode.NOT_FOUND);
    }
    return ResultUtil.success(appService.getAppVo(appEntity));
  }
}
