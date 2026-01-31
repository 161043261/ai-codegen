package com.github.tianchenghang.ai.model;

import dev.langchain4j.model.output.structured.Description;
import lombok.Data;

@Description("生成的多个代码文件结果")
@Data
public class MultiFilesResult {
  @Description("生成的 HTML 代码")
  private String htmlCode;

  @Description("生成的 CSS 代码")
  private String cssCode;

  @Description("生成的 JavaScript 代码")
  private String jsCode;

  @Description("生成的代码的描述")
  private String description;
}
