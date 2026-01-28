import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { ErrorCode } from "../error-code.enum";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let code = ErrorCode.SYSTEM_ERROR;
    let message = "系统内部异常";

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        const res = exceptionResponse as any;
        code = res.code ?? ErrorCode.SYSTEM_ERROR;
        message = res.message ?? exception.message;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      console.error("Unhandled error:", exception);
    }

    response.status(HttpStatus.OK).json({
      code,
      data: null,
      message,
    });
  }
}
