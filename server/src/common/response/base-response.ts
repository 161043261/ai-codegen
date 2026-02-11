import { ErrorCode } from '../enums/error-code';

export class BaseResponse<T = any> {
  code: number;
  data: T;
  message: string;

  constructor(code: number, data: T, message: string) {
    this.code = code;
    this.data = data;
    this.message = message;
  }

  static success<T>(data: T): BaseResponse<T> {
    return new BaseResponse(ErrorCode.SUCCESS, data, 'ok');
  }

  static error(code: ErrorCode, message: string): BaseResponse<null> {
    return new BaseResponse(code, null, message);
  }
}
