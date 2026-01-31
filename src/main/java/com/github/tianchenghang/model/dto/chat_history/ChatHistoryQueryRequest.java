package com.github.tianchenghang.model.dto.chat_history;

import com.github.tianchenghang.common.PageRequest;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class ChatHistoryQueryRequest extends PageRequest implements Serializable {

  private Long id;

  private String message;

  private String messageType;

  private Long appId;

  private Long userId;

  private LocalDateTime lastCreateTime;

  @Serial private static final long serialVersionUID = 1L;
}
