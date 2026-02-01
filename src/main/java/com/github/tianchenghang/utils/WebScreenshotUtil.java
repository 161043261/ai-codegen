package com.github.tianchenghang.utils;

import cn.hutool.core.img.ImgUtil;
import cn.hutool.core.io.FileUtil;
import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import io.github.bonigarcia.wdm.WebDriverManager;
import java.time.Duration;
import java.util.Objects;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;

@Slf4j
public class WebScreenshotUtil {
  private static final WebDriver webDriver;

  static {
    final int DEFAULT_WIDTH = 1600;
    final int DEFAULT_HEIGHT = 900;
    webDriver = initChromeDriver(DEFAULT_WIDTH, DEFAULT_HEIGHT);
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
      options.addArguments("--disable-extensions");
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
    final float COMPRESSION_QUALITY = 0.3f;
    try {
      ImgUtil.compress(
          FileUtil.file(originImagePath), FileUtil.file(compressedImagePath), COMPRESSION_QUALITY);
    } catch (Exception e) {
      log.error("压缩图片失败: {} -> {}", originImagePath, compressedImagePath, e);
      throw new BusinessException(ErrorCode.OPERATION_FAILED, "压缩图片失败");
    }
  }

  // 等待页面加载完成
  private static void waitForPageLoad(WebDriver webDriver) {
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
      log.error("等待页面加载错误: ", e);
    }
  }
}
