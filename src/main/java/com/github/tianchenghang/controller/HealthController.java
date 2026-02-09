package com.github.tianchenghang.controller;

import com.github.tianchenghang.common.BaseResponse;
import com.github.tianchenghang.common.ResultUtil;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health")
public class HealthController {

  @GetMapping("/")
  public BaseResponse<String> healthCheck() {
    return ResultUtil.success("OK");
  }
}
