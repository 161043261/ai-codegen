package com.github.tianchenghang.model.enums;

import cn.hutool.core.util.ObjUtil;
import lombok.Getter;

@Getter
public enum CodegenType {
  VANILLA_HTML("Vanilla HTML", "vanilla_html"),
  MULTI_FILES("Multiple Files", "multiple_files"),
  VITE_PROJECT("Vite Project", "vite_project");

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
