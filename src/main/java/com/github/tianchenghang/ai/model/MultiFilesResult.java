package com.github.tianchenghang.ai.model;

import dev.langchain4j.model.output.structured.Description;
import lombok.Data;

@Description("Generated multiple code files result")
@Data
public class MultiFilesResult {
  @Description("Generated HTML code")
  private String htmlCode;

  @Description("Generated CSS code")
  private String cssCode;

  @Description("Generated JavaScript code")
  private String jsCode;

  @Description("Description of the generated code")
  private String description;
}
