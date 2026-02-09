package com.github.tianchenghang.core.saver;

import cn.hutool.core.util.StrUtil;
import com.github.tianchenghang.ai.model.MultiFilesResult;
import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import com.github.tianchenghang.model.enums.CodegenType;

public class MultiFilesCodeSaver extends CodeSaver<MultiFilesResult> {
  @Override
  protected void saveFiles(MultiFilesResult result, String baseDirpath) {
    write2file(baseDirpath, "index.html", result.getHtmlCode());
    write2file(baseDirpath, "index.css", result.getCssCode());
    write2file(baseDirpath, "index.js", result.getJsCode());
  }

  @Override
  protected CodegenType getCodegenType() {
    return CodegenType.MULTI_FILES;
  }

  @Override
  protected void validateInput(MultiFilesResult result) {
    super.validateInput(result);
    if (StrUtil.isBlank(result.getHtmlCode())) {
      throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "HTML code is empty");
    }
  }
}
