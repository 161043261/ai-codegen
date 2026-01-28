package com.yupi.yuaicodemother.service.impl;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import com.yupi.yuaicodemother.exception.ErrorCode;
import com.yupi.yuaicodemother.exception.ThrowUtils;
import com.yupi.yuaicodemother.manager.LocalStorageManager;
import com.yupi.yuaicodemother.service.ScreenshotService;
import com.yupi.yuaicodemother.utils.WebScreenshotUtils;
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
    // 参数校验
    ThrowUtils.throwIf(StrUtil.isBlank(webUrl), ErrorCode.PARAMS_ERROR, "截图的网址不能为空");
    log.info("开始生成网页截图，URL：{}", webUrl);
    // 本地截图
    String localScreenshotPath = WebScreenshotUtils.saveWebPageScreenshot(webUrl);
    ThrowUtils.throwIf(StrUtil.isBlank(localScreenshotPath), ErrorCode.OPERATION_ERROR, "生成网页截图失败");
    // 保存图片到本地存储
    try {
      String fileUrl = saveScreenshotToLocal(localScreenshotPath);
      ThrowUtils.throwIf(StrUtil.isBlank(fileUrl), ErrorCode.OPERATION_ERROR, "保存截图到本地存储失败");
      log.info("截图保存成功，URL：{}", fileUrl);
      return fileUrl;
    } finally {
      // 清理临时文件
      cleanupLocalFile(localScreenshotPath);
    }
  }

  /**
   * 保存截图到本地存储
   *
   * @param localScreenshotPath 本地截图路径
   * @return 本地存储访问URL，失败返回null
   */
  private String saveScreenshotToLocal(String localScreenshotPath) {
    if (StrUtil.isBlank(localScreenshotPath)) {
      return null;
    }
    File screenshotFile = new File(localScreenshotPath);
    if (!screenshotFile.exists()) {
      log.error("截图文件不存在: {}", localScreenshotPath);
      return null;
    }
    // 生成存储路径
    String fileName = UUID.randomUUID().toString().substring(0, 8) + "_compressed.jpg";
    String storageKey = generateScreenshotKey(fileName);
    return localStorageManager.uploadFile(storageKey, screenshotFile);
  }

  /** 生成截图的存储路径 格式：/screenshots/2025/07/31/filename.jpg */
  private String generateScreenshotKey(String fileName) {
    String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
    return String.format("/screenshots/%s/%s", datePath, fileName);
  }

  /**
   * 清理本地文件
   *
   * @param localFilePath 本地文件路径
   */
  private void cleanupLocalFile(String localFilePath) {
    File localFile = new File(localFilePath);
    if (localFile.exists()) {
      FileUtil.del(localFile);
      log.info("清理临时文件成功: {}", localFilePath);
    }
  }
}
