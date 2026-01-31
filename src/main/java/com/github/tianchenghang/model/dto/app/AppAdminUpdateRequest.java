package com.github.tianchenghang.model.dto.app;

import java.io.Serial;
import java.io.Serializable;
import lombok.Data;

/** 管理员更新应用请求 */
@Data
public class AppAdminUpdateRequest implements Serializable {
  private Long id;

  // app_name
  private String appName;

  // app_cover
  private String appCover;

  // priority
  private Integer priority;

  @Serial private static final long serialVersionUID = 1L;
}
