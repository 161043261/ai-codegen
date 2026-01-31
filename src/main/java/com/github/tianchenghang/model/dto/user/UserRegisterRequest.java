package com.github.tianchenghang.model.dto.user;

import java.io.Serial;
import java.io.Serializable;
import lombok.Data;

@Data
public class UserRegisterRequest implements Serializable {
  @Serial private static final long serialVersionUID = 1L;

  private String userAccount;

  private String userPassword;

  private String checkPassword;
}
