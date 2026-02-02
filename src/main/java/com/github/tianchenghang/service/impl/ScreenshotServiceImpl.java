package com.github.tianchenghang.service.impl;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import com.github.tianchenghang.local_storage.LocalStorageManager;
import com.github.tianchenghang.service.ScreenshotService;
import com.github.tianchenghang.utils.WebPageScreenshotUtil;
import jakarta.annotation.Resource;
import java.io.File;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ScreenshotServiceImpl implements ScreenshotService {

  @Resource private LocalStorageManager localStorageManager;

  @Override
  public String generateAndUploadScreenshot(String webUrl) {
    if (StrUtil.isBlank(webUrl)) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Web URL is empty");
    }
    log.info("Starting web screenshot generation, URL: {}", webUrl);
    var screenshotLocalPath = WebPageScreenshotUtil.saveWebPageScreenshot(webUrl);
    if (StrUtil.isBlank(screenshotLocalPath)) {
      throw new BusinessException(ErrorCode.OPERATION_FAILED, "Web screenshot generation failed");
    }
    try {
      var fileUrl = saveScreenshot2local(screenshotLocalPath);
      if (StrUtil.isBlank(fileUrl)) {
        throw new BusinessException(ErrorCode.OPERATION_FAILED, "Web screenshot save failed");
      }
      log.info("Web screenshot saved successfully, URL: {}", fileUrl);
      return fileUrl;
    } finally {
      cleanupTempFile(screenshotLocalPath);
    }
  }

  private String saveScreenshot2local(String localScreenshotPath) {
    if (StrUtil.isBlank(localScreenshotPath)) {
      return null;
    }
    var screenshotFile = new File(localScreenshotPath);
    if (!screenshotFile.exists()) {
      log.error("Web screenshot not found: {}", localScreenshotPath);
      return null;
    }
    var filename = UUID.randomUUID().toString().substring(0, 8) + "_compressed.jpg";
    var storageKey = generateScreenshotKey(filename);
    return localStorageManager.uploadFile(storageKey, screenshotFile);
  }

  private String generateScreenshotKey(String filename) {
    var path = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
    return String.format("/screenshots/%s/%s", path, filename);
  }

  private void cleanupTempFile(String tempFilepath) {
    var tempFile = new File(tempFilepath);
    if (tempFile.exists()) {
      FileUtil.del(tempFile);
      log.info("Temporary file cleanup succeeded: {}", tempFilepath);
    }
  }
}
