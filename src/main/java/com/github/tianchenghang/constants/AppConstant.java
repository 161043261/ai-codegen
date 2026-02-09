package com.github.tianchenghang.constants;

public interface AppConstant {

  Integer AWESOME_APP_PRIORITY = 99;

  Integer DEFAULT_APP_PRIORITY = 0;

  String CODE_OUTPUT_ROOT_DIR = System.getProperty("user.dir") + "/tmp/code_output";

  String CODE_DEPLOY_ROOT_DIR = System.getProperty("user.dir") + "/tmp/code_deploy";

  String CODE_DEPLOY_HOST = "http://localhost";
}
