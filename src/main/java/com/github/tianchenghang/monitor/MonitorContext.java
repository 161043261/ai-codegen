package com.github.tianchenghang.monitor;

import java.io.Serial;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonitorContext {
  private String userId;
  private String appId;

  @Serial private static final long serialVersionUID = 1L;
}
