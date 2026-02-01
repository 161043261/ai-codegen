package com.github.tianchenghang.workflow.ai;

import com.github.tianchenghang.workflow.model.CodeQualityResult;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;

public interface CodeQualityCheckService {

  @SystemMessage(fromResource = "prompt/code-quality-check-system-prompt.md")
  CodeQualityResult checkCodeQuality(@UserMessage String codeContent);
}
