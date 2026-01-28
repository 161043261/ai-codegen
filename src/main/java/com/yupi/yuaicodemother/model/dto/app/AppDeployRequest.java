package com.yupi.yuaicodemother.model.dto.app;

import java.io.Serializable;
import lombok.Data;

/** 应用部署请求 */
@Data
public class AppDeployRequest implements Serializable {

  /** 应用 id */
  private Long appId;

  private static final long serialVersionUID = 1L;
}
