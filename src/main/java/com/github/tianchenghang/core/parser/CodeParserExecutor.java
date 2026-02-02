package com.github.tianchenghang.core.parser;

import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import com.github.tianchenghang.model.enums.CodegenType;

public class CodeParserExecutor {
  private static final VanillaHtmlCodeParser vanillaHtmlCodeParser = new VanillaHtmlCodeParser();
  private static final MultiFilesCodeParser multiFilesCodeParser = new MultiFilesCodeParser();

  public static Object executeParser(String codeContent, CodegenType codegenType) {
    return switch (codegenType) {
      case VANILLA_HTML -> vanillaHtmlCodeParser.parseCode(codeContent);
      case MULTI_FILES -> multiFilesCodeParser.parseCode(codeContent);
      default ->
          throw new BusinessException(
              ErrorCode.INTERNAL_SERVER_ERROR, "Unsupported codegen type: " + codegenType.getValue());
    };
  }
}
