package com.github.tianchenghang.utils;

import cn.hutool.crypto.digest.DigestUtil;
import cn.hutool.json.JSONUtil;

public class CacheKeyUtil {

  public static String generateKey(Object obj) {
    if (obj == null) {
      return DigestUtil.md5Hex("null");
    }
    var jsonStr = JSONUtil.toJsonStr(obj);
    return DigestUtil.md5Hex(jsonStr);
  }
}
