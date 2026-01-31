package com.github.tianchenghang.ai.model;

import dev.langchain4j.model.output.structured.Description;
import lombok.Data;

@Description("生成的 HTML 代码结果")
@Data
public class VanillaHtmlResult {
  @Description("生成的 HTML 代码")
  private String htmlCode;

  @Description("生成的 HTML 代码的描述")
  private String description;
}
