package com.github.tianchenghang.model.dto.app;

import java.io.Serial;
import java.io.Serializable;
import lombok.Data;

@Data
public class AppDeployRequest implements Serializable {
  // app_id
  private Long appId;

  @Serial private static final long serialVersionUID = 1L;
}
