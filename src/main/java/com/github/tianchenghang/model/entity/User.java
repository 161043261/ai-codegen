package com.github.tianchenghang.model.entity;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import com.mybatisflex.core.keygen.KeyGenerators;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("user")
public class User implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
  private Long id;

  @Column("user_account")
  private String userAccount;

  @Column("user_password")
  private String userPassword;

  @Column("username")
  private String username;

  @Column("user_avatar")
  private String userAvatar;

  @Column("user_profile")
  private String userProfile;

  @Column("user_role")
  private String userRole;

  @Column("edit_time")
  private LocalDateTime editTime;

  @Column("create_time")
  private LocalDateTime createTime;

  @Column("update_time")
  private LocalDateTime updateTime;

  @Column(value = "is_delete", isLogicDelete = true)
  private Integer isDelete;
}
