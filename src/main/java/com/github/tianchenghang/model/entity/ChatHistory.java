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
@Table("chat_history")
public class ChatHistory implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
  private Long id;

  @Column("message")
  private String message;

  @Column("message_type")
  private String messageType;

  @Column("app_id")
  private Long appId;

  @Column("user_id")
  private Long userId;

  @Column("create_time")
  private LocalDateTime createTime;

  @Column("update_time")
  private LocalDateTime updateTime;

  @Column(value = "is_delete", isLogicDelete = true)
  private Integer isDelete;
}
