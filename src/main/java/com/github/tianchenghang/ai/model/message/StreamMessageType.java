package com.github.tianchenghang.ai.model.message;

import lombok.Getter;

@Getter
public enum StreamMessageType {
  AI_RESPONSE("ai_response", "AI 响应"),
  TOOL_REQUEST("tool_request", "工具请求"),
  TOOL_EXECUTE_RESULT("tool_execute_result", "工具执行结果");

  private final String value;
  private final String text;

  StreamMessageType(String value, String text) {
    this.value = value;
    this.text = text;
  }

  public static StreamMessageType getEnumByValue(String value) {
    for (var typeEnum : values()) {
      if (typeEnum.getValue().equals(value)) {
        return typeEnum;
      }
    }
    return null;
  }
}
