package com.github.tianchenghang.local_storage;

import cn.hutool.core.util.StrUtil;
import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@Getter
public class LocalStorageManager {
  @Value("${storage.local.path:./uploads}")
  private String storagePath;

  @Value("${storage.local.base-url:http://localhost:8123/api/static}")
  private String storageBaseUrl;

  @PostConstruct
  public void init() {
    log.info("Local storage path: {}", storagePath);
    log.info("Local storage base URL: {}", storageBaseUrl);
    var storageDir = new File(storagePath);
    if (!storageDir.exists()) {
      storageDir.mkdirs();
      log.info("Creating local storage directory: {}", storageDir.getAbsolutePath());
    }
  }

  public String uploadFile(String key, File file) {
    if (file == null || !file.exists()) {
      log.error("File is empty or not found: {}", file.getAbsolutePath());
      return null;
    }
    try {
      var normalizedKey = key.startsWith("/") ? key.substring(1) : key;
      var targetPath = Paths.get(storagePath, normalizedKey);
      Files.createDirectories(targetPath.getParent());
      Files.copy(file.toPath(), targetPath, StandardCopyOption.REPLACE_EXISTING);
      var url = StrUtil.removeSuffix(storageBaseUrl, "/") + "/" + normalizedKey;
      log.error("File saved to local storage: {} -> {}", file.getName(), url);
      return url;
    } catch (IOException e) {
      log.error("Failed to save file to local storage: {}", file.getName(), e);
      return null;
    }
  }

  public boolean deleteFile(String key) {
    try {
      var normalizedKey = key.startsWith("/") ? key.substring(1) : key;
      var targetPath = Paths.get(storagePath, normalizedKey);
      return Files.deleteIfExists(targetPath);
    } catch (IOException e) {
      log.error("Failed to delete local file: {}", key, e);
      return false;
    }
  }

  public File getFile(String key) {
    var normalizedKey = key.startsWith("/") ? key.substring(1) : key;
    var file = new File(storagePath, normalizedKey);
    return file.exists() ? file : null;
  }
}
