package com.github.tianchenghang.model.dto.app;

import java.io.Serial;
import java.io.Serializable;
import lombok.Data;

@Data
public class AppAddRequest implements Serializable {
  // init_prompt
  private String initPrompt;

  @Serial private static final long serialVersionUID = 1L;
}
