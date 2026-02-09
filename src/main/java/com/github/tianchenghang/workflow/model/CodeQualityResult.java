package com.github.tianchenghang.workflow.model;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeQualityResult implements Serializable {
  @Serial private static final long serialVersionUID = 1L;

  private Boolean isPassed;

  private List<String> errors;

  private List<String> suggestions;
}
