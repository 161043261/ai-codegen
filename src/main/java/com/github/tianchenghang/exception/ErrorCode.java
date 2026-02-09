package com.github.tianchenghang.exception;

import lombok.Getter;

@Getter
public enum ErrorCode {
  SUCCESS(0, "ok"),

  BAD_REQUEST(40000, "Bad Request"),

  UNAUTHORIZED(40100, "Unauthorized"),

  NO_PERMISSION(40101, "No permission"),

  NOT_FOUND(40400, "Not Found"),

  TOO_MANY_REQUESTS(42900, "Too Many Requests"),

  FORBIDDEN(40300, "Forbidden"),

  INTERNAL_SERVER_ERROR(50000, "Internal Server Error"),

  OPERATION_FAILED(50001, "Operation Failed");

  private final int code;

  private final String message;

  ErrorCode(int code, String message) {
    this.code = code;
    this.message = message;
  }
}
