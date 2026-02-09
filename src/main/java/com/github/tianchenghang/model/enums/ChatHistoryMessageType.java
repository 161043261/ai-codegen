package com.github.tianchenghang.model.enums;

import cn.hutool.core.util.ObjUtil;
import lombok.Getter;

@Getter
public enum ChatHistoryMessageType {
  USER("User", "user"),
  AI("AI", "ai");

  private final String text;

  private final String value;

  ChatHistoryMessageType(String text, String value) {
    this.text = text;
    this.value = value;
  }

  public static ChatHistoryMessageType getEnumByValue(String value) {
    if (ObjUtil.isEmpty(value)) {
      return null;
    }
    for (var item : ChatHistoryMessageType.values()) {
      if (item.value.equals(value)) {
        return item;
      }
    }
    return null;
  }
}
