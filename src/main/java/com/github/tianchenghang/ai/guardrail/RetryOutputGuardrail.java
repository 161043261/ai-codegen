package com.github.tianchenghang.ai.guardrail;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.guardrail.OutputGuardrail;
import dev.langchain4j.guardrail.OutputGuardrailResult;

public class RetryOutputGuardrail implements OutputGuardrail {
  @Override
  public OutputGuardrailResult validate(AiMessage responseFromLLM) {
    var response = responseFromLLM.text();
    if (response == null || response.trim().isEmpty()) {
      return reprompt("响应内容为空", "请重新生成完整内容");
    }
    if (response.trim().length() < 10) {
      return reprompt("响应内容过短", "请重新生成完整内容");
    }
    if (containsSensitiveContent(response)) {
      return reprompt("包含敏感信息", "请重新生成内容, 避免包含敏感信息");
    }
    return success();
  }

  private boolean containsSensitiveContent(String response) {
    var lowerResponse = response.toLowerCase();
    var sensitiveWords =
        new String[] {
          "令牌", "密码", "密钥", "私钥", "证书",
          "api key", "credential", "password", "secret", "token",
        };
    for (var sensitiveWord : sensitiveWords) {
      if (lowerResponse.contains(sensitiveWord)) {
        return true;
      }
    }
    return false;
  }
}
