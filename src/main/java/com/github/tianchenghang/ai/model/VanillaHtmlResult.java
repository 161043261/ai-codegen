package com.github.tianchenghang.ai.model;

import dev.langchain4j.model.output.structured.Description;
import lombok.Data;

@Description("Generated HTML code result")
@Data
public class VanillaHtmlResult {
  @Description("Generated HTML code")
  private String htmlCode;

  @Description("Description of the generated HTML code")
  private String description;
}
