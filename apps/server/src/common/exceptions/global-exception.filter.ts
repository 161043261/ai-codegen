import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException } from './biz-exception';
import { ErrorCode } from '../enums/error-code';
import { BaseResponse } from '../response/base-response';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const acceptHeader = request.headers.accept || '';
    const isSseRequest = acceptHeader.includes('text/event-stream');

    if (exception instanceof BusinessException) {
      const errorCode = exception.getErrorCode();
      const message = exception.message;

      if (isSseRequest) {
        response.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        });
        response.write(
          `event: business-error\ndata: ${JSON.stringify({ code: errorCode, message })}\n\n`,
        );
        response.end();
        return;
      }

      response.status(200).json(BaseResponse.error(errorCode, message));
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response
        .status(status)
        .json(BaseResponse.error(ErrorCode.SYSTEM_ERROR, exception.message));
      return;
    }

    this.logger.error('Unhandled exception', exception);
    response
      .status(500)
      .json(BaseResponse.error(ErrorCode.SYSTEM_ERROR, '系统内部异常'));
  }
}
