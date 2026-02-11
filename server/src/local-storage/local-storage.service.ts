import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';

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

    if (!existsSync(this.storagePath)) {
      mkdirSync(this.storagePath, { recursive: true });
    }
  }

  upload(filePath: string, filename: string): Promise<string> {
    const destPath = join(this.storagePath, filename);
    mkdirSync(dirname(destPath), { recursive: true });
    copyFileSync(filePath, destPath);
    return Promise.resolve(`${this.baseUrl}/${filename}`);
  }

  getFilePath(filename: string): string {
    return join(this.storagePath, filename);
  }

  getStoragePath(): string {
    return this.storagePath;
  }
}
