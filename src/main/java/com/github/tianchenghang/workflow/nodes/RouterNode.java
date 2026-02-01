package com.github.tianchenghang.workflow.nodes;

import static org.bsc.langgraph4j.action.AsyncNodeAction.node_async;

import com.github.tianchenghang.ai.AiCodegenTypeRouteService;
import com.github.tianchenghang.model.enums.CodegenType;
import com.github.tianchenghang.utils.SpringContextUtil;
import com.github.tianchenghang.workflow.state.WorkflowContext;
import lombok.extern.slf4j.Slf4j;
import org.bsc.langgraph4j.action.AsyncNodeAction;
import org.bsc.langgraph4j.prebuilt.MessagesState;

@Slf4j
public class RouterNode {

  public static AsyncNodeAction<MessagesState<String>> create() {
    return node_async(
        state -> {
          var context = WorkflowContext.getContext(state);
          log.info("执行节点: AI 路由");

          CodegenType codegenType;
          try {
            var routeService = SpringContextUtil.getBean(AiCodegenTypeRouteService.class);
            codegenType = routeService.routeCodegenType(context.getOriginalPrompt());
            log.info("AI 路由完成, 选择代码生成类型: {} ({})", codegenType.getValue(), codegenType.getText());
          } catch (Exception e) {
            log.error(
                "AI 路由失败: {}, 使用默认代码生成类型 {}", e.getMessage(), CodegenType.VANILLA_HTML.getText());
            codegenType = CodegenType.VANILLA_HTML;
          }
          context.setCurrentStep("AI 路由");
          context.setCodegenType(codegenType);
          return WorkflowContext.setContext(context);
        });
  }
}
