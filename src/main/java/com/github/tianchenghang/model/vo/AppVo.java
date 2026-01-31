package com.github.tianchenghang.model.vo;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class AppVo implements Serializable {

  private Long id;

  private String appName;

  private String appCover;

  private String initPrompt;

  private String codegenType;

  private String deployKey;

  private LocalDateTime deployTime;

  private Integer priority;

  private Long userId;

  private LocalDateTime createTime;

  private LocalDateTime updateTime;

  private UserVo user;

  @Serial private static final long serialVersionUID = 1L;
}
