package com.github.tianchenghang.mybatis_codegen;

import cn.hutool.setting.yaml.YamlUtil;
import com.mybatisflex.codegen.Generator;
import com.mybatisflex.codegen.config.GlobalConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.util.Map;

public class MybatisCodegen {
  private static final String[] TABLE_NAMES = {"chat_history"};

  public static void main(String[] args) {
    var dict = YamlUtil.loadByPath("application.yml");
    var dataSourceConfig = (Map<String, Object>) dict.getByPath("spring.datasource");
    var url = String.valueOf(dataSourceConfig.get("url"));
    var username = String.valueOf(dataSourceConfig.get("username"));
    var password = String.valueOf(dataSourceConfig.get("password"));
    var dataSource = new HikariDataSource();
    dataSource.setJdbcUrl(url);
    dataSource.setUsername(username);
    dataSource.setPassword(password);
    var globalConfig = new GlobalConfig();
    var generator = new Generator(dataSource, globalConfig);
    generator.generate();
  }

  public static GlobalConfig createGlobalConfig() {
    var globalConfig = new GlobalConfig();
    globalConfig.getPackageConfig().setBasePackage("com.github.tianchenghang.mybatis_codegen_res");
    globalConfig
        .getStrategyConfig()
        .setGenerateTable(TABLE_NAMES)
        .setLogicDeleteColumn("is_delete");
    globalConfig.enableEntity().setWithLombok(true).setJdkVersion(21);
    globalConfig.enableMapper();
    globalConfig.enableMapperXml();
    globalConfig.enableService();
    globalConfig.enableServiceImpl();
    globalConfig.enableController();
    globalConfig
        .getJavadocConfig()
        .setAuthor("<a href=\"https://github.com/161043261\">tianchenghang</a>")
        .setSince("2025");
    return globalConfig;
  }
}
