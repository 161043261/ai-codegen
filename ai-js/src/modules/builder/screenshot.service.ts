import { Injectable, Logger } from "@nestjs/common";
import puppeteer, { Browser, Page } from "puppeteer";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

/**
 * 网页截图服务
 * 使用 Puppeteer 生成网页截图
 */
@Injectable()
export class ScreenshotService {
  private readonly logger = new Logger(ScreenshotService.name);
  private browser: Browser | null = null;

  /**
   * 生成并保存网页截图
   * @param webUrl 网页 URL
   * @returns 截图文件路径
   */
  async generateAndSaveScreenshot(webUrl: string): Promise<string> {
    if (!webUrl || webUrl.trim().length === 0) {
      throw new Error("截图的网址不能为空");
    }

    this.logger.log(`开始生成网页截图，URL：${webUrl}`);

    try {
      // 生成截图
      const screenshotBuffer = await this.captureScreenshot(webUrl);

      // 保存到临时文件
      const tempDir = path.join(os.tmpdir(), "screenshots");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const fileName = `screenshot_${Date.now()}.png`;
      const filePath = path.join(tempDir, fileName);
      fs.writeFileSync(filePath, screenshotBuffer);

      this.logger.log(`截图保存成功：${filePath}`);
      return filePath;
    } catch (error) {
      this.logger.error(`生成网页截图失败: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * 捕获网页截图
   */
  private async captureScreenshot(url: string): Promise<Buffer> {
    let page: Page | null = null;

    try {
      // 获取或创建浏览器实例
      if (!this.browser || !this.browser.connected) {
        this.browser = await puppeteer.launch({
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--disable-gpu",
          ],
        });
      }

      // 创建新页面
      page = await this.browser.newPage();

      // 设置视口大小
      await page.setViewport({
        width: 1280,
        height: 800,
        deviceScaleFactor: 2,
      });

      // 导航到页面
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // 等待页面渲染
      await this.sleep(1000);

      // 截图
      const screenshot = await page.screenshot({
        type: "png",
        fullPage: false,
      });

      return screenshot as Buffer;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * 等待指定时间
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 关闭浏览器
   */
  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
