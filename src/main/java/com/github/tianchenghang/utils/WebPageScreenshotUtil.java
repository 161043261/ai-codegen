package com.github.tianchenghang.utils;

import cn.hutool.core.img.ImgUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.RandomUtil;
import cn.hutool.core.util.StrUtil;
import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import io.github.bonigarcia.wdm.WebDriverManager;
import jakarta.annotation.PreDestroy;
import java.io.File;
import java.time.Duration;
import java.util.Objects;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;

@Slf4j
public class WebPageScreenshotUtil {
  private static final WebDriver webDriver;

  static {
    final int DEFAULT_WIDTH = 1600;
    final int DEFAULT_HEIGHT = 900;
    webDriver = initChromeDriver(DEFAULT_WIDTH, DEFAULT_HEIGHT);
  }

  @PreDestroy
  public void destroy() {
    webDriver.quit();
  }

  public static String saveWebPageScreenshot(String webUrl) {
    if (StrUtil.isBlank(webUrl)) {
      log.error("Web screenshot failed, URL is empty");
      return null;
    }
    try {
      var rootPath =
          System.getProperty("user.dir")
              + "/tmp/screenshots/"
              + UUID.randomUUID().toString().substring(0, 8);
      FileUtil.mkdir(rootPath);
      final var IMAGE_SUFFIX = ".png";
      var imageOutputPath = rootPath + File.separator + RandomUtil.randomNumbers(5) + IMAGE_SUFFIX;
      webDriver.get(webUrl);
      waitForDocumentComplete(webDriver);
      var screenshotBytes = ((TakesScreenshot) webDriver).getScreenshotAs(OutputType.BYTES);
      saveImage(screenshotBytes, imageOutputPath);
      final var COMPRESS_SUFFIX = "_compressed.jpg";
      var compressedImageOutputPath =
          rootPath + File.separator + RandomUtil.randomNumbers(5) + COMPRESS_SUFFIX;
      compressImage(imageOutputPath, compressedImageOutputPath);
      log.info("Web screenshot succeeded: {}", compressedImageOutputPath);
      FileUtil.del(imageOutputPath);
      return compressedImageOutputPath;
    } catch (Exception e) {
      log.error("Web screenshot failed: {}", webUrl, e);
      return null;
    }
  }

  private static WebDriver initChromeDriver(int width, int height) {
    try {
      WebDriverManager.chromedriver().setup();
      var options = new ChromeOptions();
      // Headless mode
      options.addArguments("--headless");
      // Disable GPU
      options.addArguments("--disable-gpu");
      // Disable sandbox mode
      options.addArguments("--no-sandbox");
      // Disable shared memory
      options.addArguments("--disable-dev-shm-usage");
      // Set window size
      options.addArguments(String.format("--window-size=%d,%d", width, height));
      // Disable extensions
      options.addArguments("--disable-workflow");
      // Set user agent
      options.addArguments(
          "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
      // Create driver
      var driver = new ChromeDriver(options);
      // Set page load timeout
      driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));
      // Set implicit wait
      driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
      return driver;
    } catch (Exception e) {
      log.error("Failed to initialize Chrome browser: ", e);
      throw new BusinessException(ErrorCode.OPERATION_FAILED, "Failed to initialize Chrome browser");
    }
  }

  private static void saveImage(byte[] imageBytes, String imagePath) {
    try {
      FileUtil.writeBytes(imageBytes, imagePath);
    } catch (Exception e) {
      log.error("Failed to save image: {}", imagePath, e);
      throw new BusinessException(ErrorCode.OPERATION_FAILED, "Failed to save image");
    }
  }

  private static void compressImage(String originImagePath, String compressedImagePath) {
    // Compression quality 30%
    final var COMPRESSION_QUALITY = 0.3f;
    try {
      ImgUtil.compress(
          FileUtil.file(originImagePath), FileUtil.file(compressedImagePath), COMPRESSION_QUALITY);
    } catch (Exception e) {
      log.error("Failed to compress image: {} -> {}", originImagePath, compressedImagePath, e);
      throw new BusinessException(ErrorCode.OPERATION_FAILED, "Failed to compress image");
    }
  }

  // Wait for page load completion
  private static void waitForDocumentComplete(WebDriver webDriver) {
    try {
      // Create page load wait object
      var wait = new WebDriverWait(webDriver, Duration.ofSeconds(10));
      // Wait for document.readyState == complete
      wait.until(
          driver ->
              Objects.equals(
                  ((JavascriptExecutor) driver).executeScript("return document.readyState"),
                  "complete"));
      // Ensure dynamic content is loaded
      Thread.sleep(3000);
      log.info("Page load completed");
    } catch (Exception e) {
      log.error("Page load wait exception: ", e);
    }
  }
}
