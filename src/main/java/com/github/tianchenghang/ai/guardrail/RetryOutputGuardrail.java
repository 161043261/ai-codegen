package com.github.tianchenghang.ai.guardrail;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.guardrail.OutputGuardrail;
import dev.langchain4j.guardrail.OutputGuardrailResult;

public class RetryOutputGuardrail implements OutputGuardrail {
  @Override
  public OutputGuardrailResult validate(AiMessage responseFromLLM) {
    var response = responseFromLLM.text();
    if (response == null || response.trim().isEmpty()) {
      return reprompt("Response is empty", "Please regenerate complete content");
    }
    if (response.trim().length() < 10) {
      return reprompt("Response is too short", "Please regenerate complete content");
    }
    if (containsSensitiveContent(response)) {
      return reprompt("Contains sensitive information", "Please regenerate content without sensitive information");
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
