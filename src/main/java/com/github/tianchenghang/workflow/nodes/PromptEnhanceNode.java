package com.github.tianchenghang.workflow.nodes;

import static org.bsc.langgraph4j.action.AsyncNodeAction.node_async;

import com.github.tianchenghang.workflow.state.WorkflowContext;
import lombok.extern.slf4j.Slf4j;
import org.bsc.langgraph4j.action.AsyncNodeAction;
import org.bsc.langgraph4j.prebuilt.MessagesState;

@Slf4j
public class PromptEnhanceNode {

  public static AsyncNodeAction<MessagesState<String>> create() {
    return node_async(
        state -> {
          var context = WorkflowContext.getContext(state);
          log.info("执行节点: 提示词增强");
          var originalPrompt = context.getOriginalPrompt();
          context.setCurrentStep("提示词增强");
          context.setEnhancedPrompt(originalPrompt);
          log.info("提示词增强完成, 增强后提示词长度: {} 字符", originalPrompt.length());
          return WorkflowContext.saveContext(context);
        });
  }
}
