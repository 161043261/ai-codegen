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
          log.info("Executing node: AI Router");

          CodegenType codegenType;
          try {
            var routeService = SpringContextUtil.getBean(AiCodegenTypeRouteService.class);
            codegenType = routeService.routeCodegenType(context.getOriginalPrompt());
            log.info(
                "AI routing completed, selected codegen type: {} ({})",
                codegenType.getValue(),
                codegenType.getText());
          } catch (Exception e) {
            log.error(
                "AI routing failed: {}, using default codegen type {}",
                e.getMessage(),
                CodegenType.VANILLA_HTML.getText());
            codegenType = CodegenType.VANILLA_HTML;
          }
          context.setCurrentStep("AI Router");
          context.setCodegenType(codegenType);
          return WorkflowContext.setContext(context);
        });
  }
}
