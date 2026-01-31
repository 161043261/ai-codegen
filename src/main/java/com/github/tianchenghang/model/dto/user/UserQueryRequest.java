package com.github.tianchenghang.model.dto.user;

import com.github.tianchenghang.common.PageRequest;
import java.io.Serial;
import java.io.Serializable;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class UserQueryRequest extends PageRequest implements Serializable {

  private Long id;

  private String username;

  private String userAccount;

  private String userProfile;

  private String userRole;

  @Serial private static final long serialVersionUID = 1L;
}
