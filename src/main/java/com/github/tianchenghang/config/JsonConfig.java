package com.github.tianchenghang.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import org.springframework.boot.jackson.JsonComponent;
import org.springframework.context.annotation.Bean;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

@JsonComponent
public class JsonConfig {

  @Bean
  public ObjectMapper jacksonObjectMapper(Jackson2ObjectMapperBuilder build) {
    var objectMapper = build.createXmlMapper(false).build();
    var module = new SimpleModule();
    module.addSerializer(Long.class, ToStringSerializer.instance);
    module.addSerializer(Long.TYPE, ToStringSerializer.instance);
    objectMapper.registerModule(module);
    return objectMapper;
  }
}
