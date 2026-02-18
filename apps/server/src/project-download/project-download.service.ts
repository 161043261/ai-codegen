import { Injectable, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import archiver, { type Archiver } from 'archiver';
import { BusinessException } from '../common/exceptions/biz-exception';
import { ErrorCode } from '../common/enums/error-code';

@Injectable()
export class ProjectDownloadService {
  private readonly logger = new Logger(ProjectDownloadService.name);

  private readonly excludeDirs = [
    'node_modules',
    '.git',
    'dist',
    '.next',
    '.nuxt',
    'build',
    'coverage',
  ];

  async downloadAsZip(
    projectDir: string,
    projectName: string,
    response: Response,
  ): Promise<void> {
    if (!existsSync(projectDir)) {
      throw new BusinessException(
        ErrorCode.NOT_FOUND_ERROR,
        'Project directory not found',
      );
    }

    response.setHeader('Content-Type', 'application/zip');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(projectName)}.zip"`,
    );

    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      this.logger.error('Archive error', err);
      throw new BusinessException(
        ErrorCode.SYSTEM_ERROR,
        'Failed to create zip file',
      );
    });

    archive.pipe(response);

    this.addDirToArchive(archive, projectDir, '');

    await archive.finalize();
  }

  private addDirToArchive(
    archive: Archiver,
    dir: string,
    prefix: string,
  ): void {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (this.excludeDirs.includes(entry.name)) continue;

      const fullPath = join(dir, entry.name);
      const archivePath = prefix ? `${prefix}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        this.addDirToArchive(archive, fullPath, archivePath);
      } else {
        archive.file(fullPath, { name: archivePath });
      }
    }
  }
}
