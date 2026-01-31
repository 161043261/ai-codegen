package com.github.tianchenghang.ai;

import com.github.tianchenghang.utils.SpringContextUtil;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.service.AiServices;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class AiCodegenTypeRouteServiceFactory {

  public AiCodegenTypeRouteService createAiCodegenTypeRouteService() {

    // src/main/java/com/github/tianchenghang/config/RouteAiModelConfig.java
    ChatModel chatModel = SpringContextUtil.getBean("routeChatModelPrototype", ChatModel.class);
    return AiServices.builder(AiCodegenTypeRouteService.class).chatModel(chatModel).build();
  }

  @Bean
  public AiCodegenTypeRouteService aiCodeGenTypeRoutingService() {
    return createAiCodegenTypeRouteService();
  }
}
