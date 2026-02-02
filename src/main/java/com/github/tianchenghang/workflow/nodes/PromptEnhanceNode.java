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
          log.info("Executing node: Prompt Enhancement");
          var originalPrompt = context.getOriginalPrompt();
          context.setCurrentStep("Prompt Enhancement");
          context.setEnhancedPrompt(originalPrompt);
          log.info("Prompt enhancement completed, enhanced prompt length: {} characters", originalPrompt.length());
          return WorkflowContext.setContext(context);
        });
  }
}
