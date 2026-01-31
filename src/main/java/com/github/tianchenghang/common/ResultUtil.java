package com.github.tianchenghang.common;

import com.github.tianchenghang.exception.ErrorCode;

public class ResultUtil {

  public static <T> BaseResponse<T> success(T data) {
    return new BaseResponse<>(0, data, "OK");
  }

  public static BaseResponse<?> error(ErrorCode errorCode) {
    return new BaseResponse<>(errorCode);
  }

  public static BaseResponse<?> error(int code, String message) {
    return new BaseResponse<>(code, null, message);
  }

  public static BaseResponse<?> error(ErrorCode errorCode, String message) {
    return new BaseResponse<>(errorCode.getCode(), null, message);
  }
}
