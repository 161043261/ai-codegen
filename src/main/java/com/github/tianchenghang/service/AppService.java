package com.github.tianchenghang.service;

import com.github.tianchenghang.model.dto.app.AppAddRequest;
import com.github.tianchenghang.model.dto.app.AppQueryRequest;
import com.github.tianchenghang.model.entity.AppEntity;
import com.github.tianchenghang.model.entity.User;
import com.github.tianchenghang.model.vo.AppVo;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.service.IService;
import java.util.List;
import reactor.core.publisher.Flux;

public interface AppService extends IService<AppEntity> {
  Flux<String> chat2codegen(Long appId, String message, User loginUser);

  Long createApp(AppAddRequest appAddRequest, User loginUser);

  String deployApp(Long appId, User loginUser);

  void generateAppScreenshotAsync(Long appId, String appUrl);

  AppVo getAppVo(AppEntity app);

  List<AppVo> getAppVoList(List<AppEntity> appList);

  QueryWrapper getQueryWrapper(AppQueryRequest appQueryRequest);
}
