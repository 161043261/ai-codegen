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
@Table("app")
public class AppEntity implements Serializable {
  @Serial private static final long serialVersionUID = 1L;

  @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
  private Long id;

  @Column("app_name")
  private String appName;

  @Column("app_cover")
  private String appCover;

  @Column("init_prompt")
  private String initPrompt;

  @Column("codegen_type")
  private String codegenType;

  @Column("deploy_key")
  private String deployKey;

  @Column("deploy_time")
  private LocalDateTime deployTime;

  @Column("priority")
  private Integer priority;

  @Column("user_id")
  private Long userId;

  @Column("edit_time")
  private LocalDateTime editTime;

  @Column("create_time")
  private LocalDateTime createTime;

  @Column("update_time")
  private LocalDateTime updateTime;

  @Column(value = "is_delete", isLogicDelete = true)
  private Integer isDelete;
}
