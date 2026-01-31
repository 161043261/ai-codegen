package com.github.tianchenghang.model.enums;

import cn.hutool.core.util.ObjUtil;
import lombok.Getter;

@Getter
public enum UserRole {
  USER("User", "user"),
  ADMIN("Admin", "admin");

  private final String text;

  private final String value;

  UserRole(String text, String value) {
    this.text = text;
    this.value = value;
  }

  public static UserRole getEnumByValue(String value) {
    if (ObjUtil.isEmpty(value)) {
      return null;
    }
    for (var item : UserRole.values()) {
      if (item.value.equals(value)) {
        return item;
      }
    }
    return null;
  }
}
