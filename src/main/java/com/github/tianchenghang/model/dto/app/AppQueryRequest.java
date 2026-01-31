package com.github.tianchenghang.model.dto.app;

import com.github.tianchenghang.common.PageRequest;
import java.io.Serial;
import java.io.Serializable;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class AppQueryRequest extends PageRequest implements Serializable {

  private Long id;

  // app_name
  private String appName;

  // app_cover
  private String appCover;

  // init_prompt
  private String initPrompt;

  // codegen_type
  private String codegenType;

  // deploy_key
  private String deployKey;

  // priority
  private Integer priority;

  // user_id
  private Long userId;

  @Serial private static final long serialVersionUID = 1L;
}
