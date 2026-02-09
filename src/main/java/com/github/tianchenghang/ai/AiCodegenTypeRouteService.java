package com.github.tianchenghang.ai;

import com.github.tianchenghang.model.enums.CodegenType;
import dev.langchain4j.service.SystemMessage;

public interface AiCodegenTypeRouteService {
  @SystemMessage(fromResource = "prompt/codegen-route-system-prompt.md")
  public CodegenType routeCodegenType(String userPrompt);
}
