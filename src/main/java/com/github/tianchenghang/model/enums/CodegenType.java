package com.github.tianchenghang.model.enums;

import cn.hutool.core.util.ObjUtil;
import lombok.Getter;

@Getter
public enum CodegenType {
  HTML("Vanilla HTML", "vanilla_html"),
  MULTI_FILE("Multiple Files", "multiple_files"),
  VUE_PROJECT("Vue App", "vue_app"),
  REACT_PROJECT("React App", "react_app");

  private final String text;
  private final String value;

  CodegenType(String text, String value) {
    this.text = text;
    this.value = value;
  }

  public static CodegenType getEnumByValue(String value) {
    if (ObjUtil.isEmpty(value)) {
      return null;
    }
    for (var item : CodegenType.values()) {
      if (item.value.equals(value)) {
        return item;
      }
    }
    return null;
  }
}
