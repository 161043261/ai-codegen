package com.github.tianchenghang.model.dto.app;

import java.io.Serial;
import java.io.Serializable;
import lombok.Data;

@Data
public class AppUpdateRequest implements Serializable {
  private Long id;

  // app_name
  private String appName;

  @Serial private static final long serialVersionUID = 1L;
}
