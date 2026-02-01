package com.github.tianchenghang.workflow.state;

import com.github.tianchenghang.model.enums.CodegenType;
import com.github.tianchenghang.workflow.model.CodeQualityResult;
import java.io.Serial;
import java.io.Serializable;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bsc.langgraph4j.prebuilt.MessagesState;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowContext implements Serializable {

  public static final String WORKFLOW_CONTEXT_KEY = "workflow-context";

  private String currentStep;

  private String originalPrompt;

  private String enhancedPrompt;

  private CodegenType codegenType;

  private String generatedCodeDir;

  private String buildResultDir;

  private CodeQualityResult codeQualityResult;

  private String errorMessage;

  @Serial private static final long serialVersionUID = 1L;

  public static WorkflowContext getContext(MessagesState<String> state) {
    return (WorkflowContext) state.data().get(WORKFLOW_CONTEXT_KEY);
  }

  public static Map<String, Object> saveContext(WorkflowContext context) {
    return Map.of(WORKFLOW_CONTEXT_KEY, context);
  }
}
