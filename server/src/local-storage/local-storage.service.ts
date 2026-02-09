import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly storagePath: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.storagePath = this.configService.get(
      'STORAGE_LOCAL_PATH',
      './uploads',
    );
    this.baseUrl = this.configService.get(
      'STORAGE_BASE_URL',
      'http://localhost:8123/api/static',
    );

    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  async upload(filePath: string, filename: string): Promise<string> {
    const destPath = path.join(this.storagePath, filename);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(filePath, destPath);
    return `${this.baseUrl}/${filename}`;
  }

  getFilePath(filename: string): string {
    return path.join(this.storagePath, filename);
  }

  getStoragePath(): string {
    return this.storagePath;
  }
}
