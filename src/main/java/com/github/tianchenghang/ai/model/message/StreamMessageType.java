package com.github.tianchenghang.ai.model.message;

import lombok.Getter;

@Getter
public enum StreamMessageType {
  AI_RESPONSE("ai_response", "AI Response"),
  TOOL_REQUEST("tool_request", "Tool Request"),
  TOOL_EXECUTE_RESULT("tool_execute_result", "Tool Execution Result");

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
