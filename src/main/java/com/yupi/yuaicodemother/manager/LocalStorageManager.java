package com.yupi.yuaicodemother.manager;

import cn.hutool.core.util.StrUtil;
import jakarta.annotation.PostConstruct;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** 本地文件存储管理器 替代 COS 对象存储，将文件存储在本地目录 */
@Component
@Slf4j
public class LocalStorageManager {

  /** 本地存储根目录 */
  @Value("${storage.local.path:./uploads}")
  private String storagePath;

  /** 访问域名/URL前缀 */
  @Value("${storage.local.base-url:http://localhost:8123/api/static}")
  private String baseUrl;

  @PostConstruct
  public void init() {
    // 确保存储目录存在
    File storageDir = new File(storagePath);
    if (!storageDir.exists()) {
      storageDir.mkdirs();
      log.info("创建本地存储目录: {}", storageDir.getAbsolutePath());
    }
  }

  /**
   * 上传文件到本地存储
   *
   * @param key 存储路径（如 /screenshots/2025/01/28/xxx.jpg）
   * @param file 要上传的文件
   * @return 文件的访问URL，失败返回null
   */
  public String uploadFile(String key, File file) {
    if (file == null || !file.exists()) {
      log.error("文件不存在或为空");
      return null;
    }
    try {
      // 规范化 key，去掉开头的 /
      String normalizedKey = key.startsWith("/") ? key.substring(1) : key;
      // 目标文件路径
      Path targetPath = Paths.get(storagePath, normalizedKey);
      // 确保父目录存在
      Files.createDirectories(targetPath.getParent());
      // 复制文件到目标位置
      Files.copy(file.toPath(), targetPath, StandardCopyOption.REPLACE_EXISTING);
      // 构建访问 URL
      String url = StrUtil.removeSuffix(baseUrl, "/") + "/" + normalizedKey;
      log.info("文件保存到本地成功：{} -> {}", file.getName(), url);
      return url;
    } catch (Exception e) {
      log.error("文件保存到本地失败：{}", file.getName(), e);
      return null;
    }
  }

  /**
   * 删除本地文件
   *
   * @param key 存储路径
   * @return 是否删除成功
   */
  public boolean deleteFile(String key) {
    try {
      String normalizedKey = key.startsWith("/") ? key.substring(1) : key;
      Path targetPath = Paths.get(storagePath, normalizedKey);
      return Files.deleteIfExists(targetPath);
    } catch (Exception e) {
      log.error("删除本地文件失败：{}", key, e);
      return false;
    }
  }

  /**
   * 获取本地文件
   *
   * @param key 存储路径
   * @return 文件对象，不存在返回null
   */
  public File getFile(String key) {
    String normalizedKey = key.startsWith("/") ? key.substring(1) : key;
    File file = new File(storagePath, normalizedKey);
    return file.exists() ? file : null;
  }

  /** 获取存储根目录 */
  public String getStoragePath() {
    return storagePath;
  }

  /** 获取访问 URL 前缀 */
  public String getBaseUrl() {
    return baseUrl;
  }
}
