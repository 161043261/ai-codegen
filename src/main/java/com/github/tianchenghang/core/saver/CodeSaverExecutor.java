package com.github.tianchenghang.core.saver;

import com.github.tianchenghang.ai.model.MultiFilesResult;
import com.github.tianchenghang.ai.model.VanillaHtmlResult;
import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import com.github.tianchenghang.model.enums.CodegenType;
import java.io.File;

public class CodeSaverExecutor {
  private static final VanillaHtmlCodeSaver vanillaHtmlCodeSaver = new VanillaHtmlCodeSaver();
  private static final MultiFilesCodeSaver multiFilesCodeSaver = new MultiFilesCodeSaver();

  public static File executeSaver(Object codeResult, CodegenType codegenType, Long appId) {
    return switch (codegenType) {
      case VANILLA_HTML -> vanillaHtmlCodeSaver.saveCode((VanillaHtmlResult) codeResult, appId);
      case MULTI_FILES -> multiFilesCodeSaver.saveCode((MultiFilesResult) codeResult, appId);
      default ->
          throw new BusinessException(
              ErrorCode.INTERNAL_SERVER_ERROR, "Unsupported codegen type: " + codegenType);
    };
  }
}
