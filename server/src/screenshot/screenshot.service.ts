import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppEntity } from '../database/entities/app-entity';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { ensureDir } from '../common/utils/ensure-dir.util';

@Injectable()
export class ScreenshotService {
  private readonly logger = new Logger(ScreenshotService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(AppEntity)
    private readonly appRepository: Repository<AppEntity>,
    private readonly localStorageService: LocalStorageService,
  ) {}

  async captureAndUpload(url: string, app: AppEntity): Promise<void> {
    try {
      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 720 });
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const screenshotDir = join(process.cwd(), 'tmp', 'screenshots');
      ensureDir(screenshotDir);

      const screenshotPath = join(screenshotDir, `${app.id}.png`);

      await page.screenshot({ path: screenshotPath, type: 'png' });
      await browser.close();

      const uploadedUrl = await this.localStorageService.upload(
        screenshotPath,
        `${app.codegenType}_${app.id}.png`,
      );
      this.logger.log(`Uploaded screenshot to ${uploadedUrl}`);

      app.appCover = uploadedUrl;
      await this.appRepository.save(app);

      if (existsSync(screenshotPath)) {
        unlinkSync(screenshotPath);
      }

      this.logger.log(`Screenshot captured and uploaded for app ${app.id}`);
    } catch (error) {
      this.logger.error(`Screenshot failed for app ${app.id}`, error);
    }
  }
}
