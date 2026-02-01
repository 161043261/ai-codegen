package com.github.tianchenghang.core.saver;

import cn.hutool.core.util.StrUtil;
import com.github.tianchenghang.ai.model.VanillaHtmlResult;
import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import com.github.tianchenghang.model.enums.CodegenType;

public class VanillaHtmlCodeSaver extends CodeSaver<VanillaHtmlResult> {
  @Override
  protected void saveFiles(VanillaHtmlResult result, String baseDirpath) {
    write2file(baseDirpath, "index.html", result.getHtmlCode());
  }

  @Override
  protected CodegenType getCodegenType() {
    return CodegenType.VANILLA_HTML;
  }

  @Override
  protected void validateInput(VanillaHtmlResult result) {
    super.validateInput(result);
    if (StrUtil.isBlank(result.getHtmlCode())) {
      throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "HTML 代码为空");
    }
  }
}
