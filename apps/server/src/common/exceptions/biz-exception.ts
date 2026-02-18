import { HttpException } from '@nestjs/common';
import { ErrorCode, ErrorMessage } from '../enums/error-code';

export class BusinessException extends HttpException {
  private readonly errorCode: ErrorCode;

  constructor(errorCode: ErrorCode, message?: string) {
    const msg = message || ErrorMessage[errorCode] || 'Unknown error';
    super(msg, 200);
    this.errorCode = errorCode;
  }

  getErrorCode(): ErrorCode {
    return this.errorCode;
  }
}
