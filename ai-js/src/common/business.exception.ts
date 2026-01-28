import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorCode, ErrorMessage } from "./error-code.enum";

export class BusinessException extends HttpException {
  private readonly errorCode: ErrorCode;

  constructor(errorCode: ErrorCode, message?: string) {
    super(
      {
        code: errorCode,
        message: message || ErrorMessage[errorCode],
        data: null,
      },
      HttpStatus.OK,
    );
    this.errorCode = errorCode;
  }

  getErrorCode(): ErrorCode {
    return this.errorCode;
  }

  static paramsError(message?: string): BusinessException {
    return new BusinessException(ErrorCode.PARAMS_ERROR, message);
  }

  static notLogin(): BusinessException {
    return new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
  }

  static noAuth(message?: string): BusinessException {
    return new BusinessException(ErrorCode.NO_AUTH_ERROR, message);
  }

  static notFound(message?: string): BusinessException {
    return new BusinessException(ErrorCode.NOT_FOUND_ERROR, message);
  }

  static systemError(message?: string): BusinessException {
    return new BusinessException(ErrorCode.SYSTEM_ERROR, message);
  }

  static operationError(message?: string): BusinessException {
    return new BusinessException(ErrorCode.OPERATION_ERROR, message);
  }
}
