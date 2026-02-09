package com.github.tianchenghang.core;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.StrUtil;
import com.github.tianchenghang.ai.model.MultiFilesResult;
import com.github.tianchenghang.ai.model.VanillaHtmlResult;
import com.github.tianchenghang.constants.AppConstant;
import com.github.tianchenghang.model.enums.CodegenType;
import java.io.File;
import java.nio.charset.StandardCharsets;

public class CodeSaver {
  private static final String CODE_SAVE_ROOT_DIR = AppConstant.CODE_OUTPUT_ROOT_DIR;

  public static File saveVanillaHtmlResult(VanillaHtmlResult vanillaHtmlResult) {
    var baseDirpath = buildUniqueDir(CodegenType.VANILLA_HTML.getValue());
    write2file(baseDirpath, "index.html", vanillaHtmlResult.getHtmlCode());
    return new File(baseDirpath);
  }

  public static File saveMultiFilesResult(MultiFilesResult multiFilesResult) {
    var baseDirpath = buildUniqueDir(CodegenType.MULTI_FILES.getValue());
    write2file(baseDirpath, "index.html", multiFilesResult.getHtmlCode());
    write2file(baseDirpath, "index.css", multiFilesResult.getCssCode());
    write2file(baseDirpath, "index.js", multiFilesResult.getJsCode());
    return new File(baseDirpath);
  }

  private static String buildUniqueDir(String bizType) {
    var uniqueDirname = StrUtil.format("{}_{}", bizType, IdUtil.getSnowflakeNextIdStr());
    var dirpath = CODE_SAVE_ROOT_DIR + File.separator + uniqueDirname;
    FileUtil.mkdir(dirpath);
    return dirpath;
  }

  private static void write2file(String dirpath, String filename, String content) {
    var filepath = dirpath + File.separator + filename;
    FileUtil.writeString(content, filepath, StandardCharsets.UTF_8);
  }
}
