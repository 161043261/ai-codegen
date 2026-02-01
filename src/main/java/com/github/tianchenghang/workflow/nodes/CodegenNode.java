package com.github.tianchenghang.workflow.nodes;

import static org.bsc.langgraph4j.action.AsyncNodeAction.node_async;

import com.github.tianchenghang.constants.AppConstant;
import com.github.tianchenghang.core.AiCodegenFacade;
import com.github.tianchenghang.utils.SpringContextUtil;
import com.github.tianchenghang.workflow.model.CodeQualityResult;
import com.github.tianchenghang.workflow.state.WorkflowContext;
import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.bsc.langgraph4j.action.AsyncNodeAction;
import org.bsc.langgraph4j.prebuilt.MessagesState;

@Slf4j
public class CodegenNode {

  public static AsyncNodeAction<MessagesState<String>> create() {
    return node_async(
        state -> {
          var context = WorkflowContext.getContext(state);
          log.info("执行节点: 代码生成");
          var userMessage = buildUserMessage(context);
          var codegenType = context.getCodegenType();
          var aiCodegenFacade = SpringContextUtil.getBean(AiCodegenFacade.class);
          log.info("执行代码生成, 类型: {} ({})", codegenType.getValue(), codegenType.getText());
          var appId = 0L;
          var codeStream =
              aiCodegenFacade.generateAndSaveCodeStream(userMessage, codegenType, appId);
          codeStream.blockLast(Duration.ofMinutes(10)); // 最多等待 10min
          var generatedCodeDir =
              String.format(
                  "%s/%s_%s", AppConstant.CODE_OUTPUT_ROOT_DIR, codegenType.getValue(), appId);
          log.info("代码生成完成, 输出目录: {}", generatedCodeDir);
          context.setCurrentStep("代码生成");
          context.setGeneratedCodeDir(generatedCodeDir);
          return WorkflowContext.setContext(context);
        });
  }

  private static String buildUserMessage(WorkflowContext context) {
    var userMessage = context.getEnhancedPrompt();
    var codeQualityResult = context.getCodeQualityResult();
    if (isCodeQualityCheckFailed(codeQualityResult)) {
      userMessage = buildBugfixPrompt(codeQualityResult);
    }
    return userMessage;
  }

  private static boolean isCodeQualityCheckFailed(CodeQualityResult codeQualityResult) {
    return codeQualityResult != null
        && !codeQualityResult.getIsPassed()
        && codeQualityResult.getErrors() != null
        && !codeQualityResult.getErrors().isEmpty();
  }

  private static String buildBugfixPrompt(CodeQualityResult codeQualityResult) {
    var errorInfo = new StringBuilder();
    errorInfo.append("\n\n生成的代码存在以下问题, 请修复:\n");
    codeQualityResult
        .getErrors()
        .forEach(error -> errorInfo.append("- ").append(error).append("\n"));
    if (codeQualityResult.getSuggestions() != null
        && !codeQualityResult.getSuggestions().isEmpty()) {
      errorInfo.append("\n修复建议:\n");
      codeQualityResult
          .getSuggestions()
          .forEach(suggestion -> errorInfo.append("- ").append(suggestion).append("\n"));
    }
    errorInfo.append("\n请根据上述问题和修复建议重新生成代码");
    return errorInfo.toString();
  }
}
