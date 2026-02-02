package com.github.tianchenghang.model.dto.app;

import java.io.Serial;
import java.io.Serializable;
import lombok.Data;

/** Admin update application request */
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
