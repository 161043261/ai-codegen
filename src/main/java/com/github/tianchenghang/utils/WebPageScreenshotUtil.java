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
      log.error("网页截图失败, url 为空");
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
      log.info("网页截图成功: {}", compressedImageOutputPath);
      FileUtil.del(imageOutputPath);
      return compressedImageOutputPath;
    } catch (Exception e) {
      log.error("网页截图失败: {}", webUrl, e);
      return null;
    }
  }

  private static WebDriver initChromeDriver(int width, int height) {
    try {
      WebDriverManager.chromedriver().setup();
      var options = new ChromeOptions();
      // 无头模式
      options.addArguments("--headless");
      // 禁用 gpu
      options.addArguments("--disable-gpu");
      // 禁用沙盒模式
      options.addArguments("--no-sandbox");
      // 禁用共享内存
      options.addArguments("--disable-dev-shm-usage");
      // 设置窗口大小
      options.addArguments(String.format("--window-size=%d,%d", width, height));
      // 禁用扩展
      options.addArguments("--disable-workflow");
      // 设置用户代理
      options.addArguments(
          "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
      // 创建驱动
      var driver = new ChromeDriver(options);
      // 设置页面加载超时
      driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));
      // 设置隐式等待
      driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
      return driver;
    } catch (Exception e) {
      log.error("初始化 chrome 浏览器失败: ", e);
      throw new BusinessException(ErrorCode.OPERATION_FAILED, "初始化 chrome 浏览器失败");
    }
  }

  private static void saveImage(byte[] imageBytes, String imagePath) {
    try {
      FileUtil.writeBytes(imageBytes, imagePath);
    } catch (Exception e) {
      log.error("保存图片失败: {}", imagePath, e);
      throw new BusinessException(ErrorCode.OPERATION_FAILED, "保存图片失败");
    }
  }

  private static void compressImage(String originImagePath, String compressedImagePath) {
    // 压缩质量 30%
    final var COMPRESSION_QUALITY = 0.3f;
    try {
      ImgUtil.compress(
          FileUtil.file(originImagePath), FileUtil.file(compressedImagePath), COMPRESSION_QUALITY);
    } catch (Exception e) {
      log.error("压缩图片失败: {} -> {}", originImagePath, compressedImagePath, e);
      throw new BusinessException(ErrorCode.OPERATION_FAILED, "压缩图片失败");
    }
  }

  // 等待页面加载完成
  private static void waitForDocumentComplete(WebDriver webDriver) {
    try {
      // 创建等待页面加载对象
      var wait = new WebDriverWait(webDriver, Duration.ofSeconds(10));
      // 等待 document.readyState == complete
      wait.until(
          driver ->
              Objects.equals(
                  ((JavascriptExecutor) driver).executeScript("return document.readyState"),
                  "complete"));
      // 确保动态内容加载完成
      Thread.sleep(3000);
      log.info("页面加载完成");
    } catch (Exception e) {
      log.error("等待页面加载异常: ", e);
    }
  }
}
