import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { existsSync, createReadStream } from 'fs';
import { join, resolve, extname } from 'path';
import { BusinessException } from '../common/exceptions/biz-exception';
import { ErrorCode } from '../common/enums/error-code';
import { ensureDir } from '../common/utils/ensure-dir.util';

@Controller()
export class StaticResourceController {
  private readonly mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
  };

  @Get('static/*filePath')
  serveUploadedStatic(
    @Param('filePath') filePath: string,
    @Res() response: Response,
  ) {
    const outputDir = join(
      process.cwd(),
      'tmp/code_output',
      filePath.replaceAll(',', '/'),
    );
    ensureDir(outputDir);
    this.serveFile(outputDir, './index.html', response);
  }

  @Get('dist/:deployKey/*filePath')
  serveDeployedStatic(
    @Param('deployKey') deployKey: string,
    @Param('filePath') filePath: string,
    @Res() response: Response,
  ) {
    const deployDir = join(process.cwd(), 'tmp', 'code_deploy', deployKey);
    ensureDir(deployDir);

    const relativePath = filePath
      ? filePath.replaceAll(',', '/')
      : './index.html';
    this.serveFile(deployDir, relativePath, response);
  }

  private serveFile(
    baseDir: string,
    relativePath: string,
    response: Response,
  ): void {
    const filePath = join(baseDir, relativePath);
    const normalizedBase = resolve(baseDir);
    const normalizedFile = resolve(filePath);

    if (!normalizedFile.startsWith(normalizedBase)) {
      throw new BusinessException(
        ErrorCode.FORBIDDEN_ERROR,
        'Path traversal not allowed',
      );
    }

    if (!existsSync(filePath)) {
      throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, 'File not found');
    }

    const ext = extname(filePath).toLowerCase();
    const mimeType = this.mimeTypes[ext] || 'application/octet-stream';

    response.setHeader('Content-Type', mimeType);
    response.setHeader('Cache-Control', 'public, max-age=86400');
    const stream = createReadStream(filePath);
    stream.pipe(response);
  }
}
