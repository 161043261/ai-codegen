package com.github.tianchenghang.core.saver;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import com.github.tianchenghang.constants.AppConstant;
import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import com.github.tianchenghang.model.enums.CodegenType;
import java.io.File;
import java.nio.charset.StandardCharsets;

public abstract class CodeSaver<T> {
  private static final String CODE_SAVE_ROOT_DIR = AppConstant.CODE_OUTPUT_ROOT_DIR;

  public final File saveCode(T result, Long appId) {
    validateInput(result);
    var baseDirpath = buildUniqueDir(appId);
    saveFiles(result, baseDirpath);
    return new File(baseDirpath);
  }

  public final void write2file(String dirpath, String filename, String content) {
    if (StrUtil.isNotBlank(content)) {
      var filepath = dirpath + File.separator + filename;
      FileUtil.writeString(content, filepath, StandardCharsets.UTF_8);
    }
  }

  protected void validateInput(T result) {
    if (result == null) {
      throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "保存代码异常: result 为空");
    }
  }

  protected String buildUniqueDir(Long appId) {
    if (appId == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "保存代码异常: appId 为空");
    }
    var codegenType = getCodegenType().getValue();
    var uniqueDirname = StrUtil.format("{}_{}", codegenType, appId);
    var dirpath = CODE_SAVE_ROOT_DIR + File.separator + uniqueDirname;
    FileUtil.mkdir(dirpath);
    return dirpath;
  }

  protected abstract void saveFiles(T result, String baseDirPath);

  protected abstract CodegenType getCodegenType();
}
