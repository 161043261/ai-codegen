package com.github.tianchenghang.exception;

import lombok.Getter;

@Getter
public enum ErrorCode {
  SUCCESS(0, "ok"),

  PARAMS_ERROR(40000, "Bad Request"),

  NOT_LOGIN_ERROR(40100, "Unauthorized"),

  NO_AUTH_ERROR(40101, "No permission"),

  NOT_FOUND_ERROR(40400, "Not Found"),

  TOO_MANY_REQUEST(42900, "Too Many Requests"),

  FORBIDDEN_ERROR(40300, "Forbidden"),

  SYSTEM_ERROR(50000, "Internal Server Error"),

  OPERATION_ERROR(50001, "Operation Failed");

  private final int code;

  private final String message;

  ErrorCode(int code, String message) {
    this.code = code;
    this.message = message;
  }
}
