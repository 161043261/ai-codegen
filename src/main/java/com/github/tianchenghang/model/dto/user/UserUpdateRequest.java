package com.github.tianchenghang.model.dto.user;

import java.io.Serial;
import java.io.Serializable;
import lombok.Data;

@Data
public class UserUpdateRequest implements Serializable {

  private Long id;

  private String username;

  private String userAvatar;

  private String userProfile;

  private String userRole;

  @Serial private static final long serialVersionUID = 1L;
}
