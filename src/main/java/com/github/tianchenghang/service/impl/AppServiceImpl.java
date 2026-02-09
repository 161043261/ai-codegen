package com.github.tianchenghang.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.RandomUtil;
import cn.hutool.core.util.StrUtil;
import com.github.tianchenghang.ai.AiCodegenTypeRouteServiceFactory;
import com.github.tianchenghang.common.PageRequest;
import com.github.tianchenghang.constants.AppConstant;
import com.github.tianchenghang.core.AiCodegenFacade;
import com.github.tianchenghang.core.builder.ViteProjectBuilder;
import com.github.tianchenghang.core.handler.StreamHandlerExecutor;
import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import com.github.tianchenghang.mapper.AppMapper;
import com.github.tianchenghang.model.dto.app.AppAddRequest;
import com.github.tianchenghang.model.dto.app.AppQueryRequest;
import com.github.tianchenghang.model.entity.AppEntity;
import com.github.tianchenghang.model.entity.User;
import com.github.tianchenghang.model.enums.ChatHistoryMessageType;
import com.github.tianchenghang.model.enums.CodegenType;
import com.github.tianchenghang.model.vo.AppVo;
import com.github.tianchenghang.monitor.MonitorContext;
import com.github.tianchenghang.monitor.MonitorContextHolder;
import com.github.tianchenghang.service.AppService;
import com.github.tianchenghang.service.ChatHistoryService;
import com.github.tianchenghang.service.ScreenshotService;
import com.github.tianchenghang.service.UserService;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import java.io.File;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import javax.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
@Slf4j
public class AppServiceImpl extends ServiceImpl<AppMapper, AppEntity> implements AppService {

  @Value("${codegen.deploy-host:http://localhost}")
  private String deployHost;

  @Resource private UserService userService;
  @Resource private AiCodegenFacade aiCodegenFacade;
  @Resource private ChatHistoryService chatHistoryService;
  @Resource private StreamHandlerExecutor streamHandlerExecutor;
  @Resource private ViteProjectBuilder viteProjectBuilder;
  @Resource private ScreenshotService screenshotService;
  @Resource private AiCodegenTypeRouteServiceFactory aiCodegenTypeRouteServiceFactory;

  @Override
  public Flux<String> chat2codegen(Long appId, String message, User loginUser) {
    if (appId == null || appId <= 0) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Invalid project ID");
    }
    if (StrUtil.isBlank(message)) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Prompt is empty");
    }
    var appEntity = this.getById(appId);
    if (appEntity == null) {
      throw new BusinessException(ErrorCode.NOT_FOUND, "Project not found");
    }
    if (!appEntity.getUserId().equals(loginUser.getId())) {
      throw new BusinessException(ErrorCode.NO_PERMISSION, "Access denied");
    }
    var codegenType = appEntity.getCodegenType();
    var codegenTypeEnum = CodegenType.getEnumByValue(codegenType);
    if (codegenTypeEnum == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Invalid codegen type");
    }
    chatHistoryService.addChatMessage(
        appId, message, ChatHistoryMessageType.USER.getValue(), loginUser.getId());
    MonitorContextHolder.setContext(
        MonitorContext.builder()
            .userId(loginUser.getId().toString())
            .appId(appId.toString())
            .build());
    var codeStream = aiCodegenFacade.generateAndSaveCodeStream(message, codegenTypeEnum, appId);
    return streamHandlerExecutor
        .handle(codeStream, chatHistoryService, appId, loginUser, codegenTypeEnum)
        .doFinally(
            signalType -> {
              // Cleanup when stream ends (success/failure/cancel)
              MonitorContextHolder.clearContext();
            });
  }

  @Override
  public Long createApp(AppAddRequest appAddRequest, User loginUser) {
    var initialPrompt = appAddRequest.getInitPrompt();
    if (StrUtil.isBlank(initialPrompt)) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Prompt is empty");
    }
    var appEntity = new AppEntity();
    BeanUtil.copyProperties(appAddRequest, appEntity);
    appEntity.setUserId(loginUser.getId());
    appEntity.setAppName(initialPrompt.substring(0, Math.min(initialPrompt.length(), 12)));
    var aiCodegenTypeRouteService =
        aiCodegenTypeRouteServiceFactory.createAiCodegenTypeRouteService();
    var codegenType = aiCodegenTypeRouteService.routeCodegenType(initialPrompt);
    appEntity.setCodegenType(codegenType.getValue());
    var ok = this.save(appEntity);
    if (!ok) {
      throw new BusinessException(ErrorCode.OPERATION_FAILED);
    }
    log.info(
        "Code generation succeeded, appId: {}, type: {}",
        appEntity.getId(),
        codegenType.getValue());
    return appEntity.getId();
  }

  @Override
  public String deployApp(Long appId, User loginUser) {
    if (appId == null || appId <= 0) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Invalid project ID");
    }
    if (loginUser == null) {
      throw new BusinessException(ErrorCode.UNAUTHORIZED, "User not logged in");
    }
    var appEntity = this.getById(appId);
    if (appEntity == null) {
      throw new BusinessException(ErrorCode.NOT_FOUND, "Project not found");
    }
    if (!appEntity.getUserId().equals(loginUser.getId())) {
      throw new BusinessException(ErrorCode.NO_PERMISSION, "No deployment permission");
    }
    var deployKey = appEntity.getDeployKey();
    if (StrUtil.isBlank(deployKey)) {
      deployKey = RandomUtil.randomString(6);
    }
    var codegenType = appEntity.getCodegenType();
    var sourceDirname = codegenType + "_" + appId;
    var sourceDirpath = AppConstant.CODE_OUTPUT_ROOT_DIR + File.separator + sourceDirname;
    var sourceDir = new File(sourceDirpath);
    if (!sourceDir.exists() || !sourceDir.isDirectory()) {
      throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "Project not found");
    }
    var codegenTypeEnum = CodegenType.getEnumByValue(codegenType);
    if (codegenTypeEnum == CodegenType.VITE_PROJECT) {
      var ok = viteProjectBuilder.buildProject(sourceDirpath);
      if (!ok) {
        throw new BusinessException(
            ErrorCode.INTERNAL_SERVER_ERROR, "Vite project build failed, please retry");
      }
      var distDir = new File(sourceDirpath, "dist");
      if (!distDir.exists()) {
        throw new BusinessException(
            ErrorCode.INTERNAL_SERVER_ERROR,
            "Vite project built successfully, but dist directory not found");
      }
      sourceDir = distDir;
    }
    var deployDirpath = AppConstant.CODE_DEPLOY_ROOT_DIR + File.separator + deployKey;
    try {
      FileUtil.copyContent(sourceDir, new File(deployDirpath), true);
    } catch (Exception e) {
      throw new BusinessException(
          ErrorCode.INTERNAL_SERVER_ERROR, "Project deployment failed: " + e.getMessage());
    }
    var updateApp = new AppEntity();
    updateApp.setId(appId);
    updateApp.setDeployKey(deployKey);
    updateApp.setDeployTime(LocalDateTime.now());
    var ok = this.updateById(updateApp);
    if (!ok) {
      throw new BusinessException(
          ErrorCode.OPERATION_FAILED, "Failed to update project deployment info");
    }
    var appDeployUrl = String.format("%s/%s/", deployHost, deployKey);
    generateAppScreenshotAsync(appId, appDeployUrl);
    return appDeployUrl;
  }

  @Override
  public void generateAppScreenshotAsync(Long appId, String appUrl) {
    Thread.startVirtualThread(
        () -> {
          var screenshotUrl = screenshotService.generateAndUploadScreenshot(appUrl);
          // Update cover in database
          var updateApp = new AppEntity();
          updateApp.setId(appId);
          updateApp.setAppCover(screenshotUrl);
          var updated = this.updateById(updateApp);
          if (!updated) {
            throw new BusinessException(
                ErrorCode.OPERATION_FAILED, "Failed to update project cover");
          }
        });
  }

  @Override
  public AppVo getAppVo(AppEntity app) {
    if (app == null) {
      return null;
    }
    var appVo = new AppVo();
    BeanUtil.copyProperties(app, appVo);
    var userId = app.getUserId();
    if (userId != null) {
      var user = userService.getById(userId);
      var userVo = userService.getUserVo(user);
      appVo.setUser(userVo);
    }
    return appVo;
  }

  @Override
  public List<AppVo> getAppVoList(List<AppEntity> appList) {
    if (CollUtil.isEmpty(appList)) {
      return new ArrayList<>();
    }
    var userIds = appList.stream().map(AppEntity::getUserId).collect(Collectors.toSet());
    var userVoMap =
        userService.listByIds(userIds).stream()
            .collect(Collectors.toMap(User::getId, userService::getUserVo));
    return appList.stream()
        .map(
            app -> {
              var appVo = getAppVo(app);
              var userVo = userVoMap.get(app.getUserId());
              appVo.setUser(userVo);
              return appVo;
            })
        .collect(Collectors.toList());
  }

  @Override
  public QueryWrapper getQueryWrapper(AppQueryRequest appQueryRequest) {
    if (appQueryRequest == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var id = appQueryRequest.getId();
    var appName = appQueryRequest.getAppName();
    var appCover = appQueryRequest.getAppCover();
    var initPrompt = appQueryRequest.getInitPrompt();
    var codegenType = appQueryRequest.getCodegenType();
    var deployKey = appQueryRequest.getDeployKey();
    var priority = appQueryRequest.getPriority();
    var userId = appQueryRequest.getUserId();
    var sortField = appQueryRequest.getSortField();
    var sortOrder = appQueryRequest.getSortOrder();
    return QueryWrapper.create()
        .eq("id", id)
        .like("app_name", appName)
        .like("app_cover", appCover)
        .like("init_prompt", initPrompt)
        .eq("codegen_type", codegenType)
        .eq("deploy_key", deployKey)
        .eq("priority", priority)
        .eq("user_id", userId)
        .orderBy(sortField, PageRequest.SortOrder.ASC.equals(sortOrder));
  }

  @Override
  public boolean removeById(Serializable id) {
    if (id == null) {
      return false;
    }
    var appId = Long.parseLong(id.toString());
    if (appId <= 0) {
      return false;
    }
    try {
      chatHistoryService.deleteByAppId(appId);
    } catch (Exception e) {
      log.error("Failed to delete chat history: {}", e.getMessage());
    }
    return super.removeById(id);
  }
}
