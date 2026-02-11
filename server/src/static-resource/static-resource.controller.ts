import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { existsSync, createReadStream } from 'fs';
import { join, resolve, extname } from 'path';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/enums/error-code';

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
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
  };

  @Get('static/:deployKey/*filePath')
  serveUploadedStatic(
    @Param('deployKey') deployKey: string,
    @Param('filePath') filePath: string,
    @Res() response: Response,
  ) {
    const uploadPath = join(process.cwd(), 'uploads', deployKey);
    const relativePath = filePath || 'index.html';
    this.serveFile(uploadPath, relativePath, response);
  }

  @Get('dist/:deployKey/*filePath')
  serveDeployedStatic(
    @Param('deployKey') deployKey: string,
    @Param('filePath') filePath: string,
    @Res() response: Response,
  ) {
    const deployDir = join(process.cwd(), 'tmp', 'code_deploy', deployKey);
    const relativePath = filePath || 'index.html';
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
