package com.github.tianchenghang.model.vo;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class UserVo implements Serializable {

  private Long id;

  private String userAccount;

  private String username;

  private String userAvatar;

  private String userProfile;

  private String userRole;

  private LocalDateTime createTime;

  @Serial private static final long serialVersionUID = 1L;
}
