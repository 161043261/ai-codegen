package com.github.tianchenghang.workflow;

import static org.bsc.langgraph4j.StateGraph.END;
import static org.bsc.langgraph4j.StateGraph.START;
import static org.bsc.langgraph4j.action.AsyncEdgeAction.edge_async;

import cn.hutool.json.JSONUtil;
import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import com.github.tianchenghang.model.enums.CodegenType;
import com.github.tianchenghang.workflow.nodes.*;
import com.github.tianchenghang.workflow.state.WorkflowContext;
import java.io.IOException;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.bsc.langgraph4j.CompiledGraph;
import org.bsc.langgraph4j.GraphRepresentation;
import org.bsc.langgraph4j.GraphStateException;
import org.bsc.langgraph4j.prebuilt.MessagesState;
import org.bsc.langgraph4j.prebuilt.MessagesStateGraph;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.publisher.Flux;

@Slf4j
public class CodegenWorkflow {

  public static class NodeIds {
    public static final String PROMPT_ENHANCE = "prompt-enhance";
    public static final String ROUTER = "router";
    public static final String CODEGEN = "codegen";
    public static final String CODE_QUALITY_CHECK = "code-quality-check";
    public static final String PROJECT_BUILD = "project-builder";
  }

  public static class EventNames {
    public static final String WORKFLOW_START = "workflow-start";
    public static final String STEP_COMPLETE = "step-complete";
    public static final String WORKFLOW_COMPLETE = "workflow-complete";
    public static final String WORKFLOW_ERROR = "workflow-error";
  }

  public static class Conditions {
    public static final String BUILD = "builder";
    public static final String SKIP_BUILD = "skip-builder";
    public static final String FAILED = "failed";
  }

  public CompiledGraph<MessagesState<String>> createWorkflow() {
    try {
      return new MessagesStateGraph<String>()
          .addNode(NodeIds.PROMPT_ENHANCE, PromptEnhanceNode.create())
          .addNode(NodeIds.ROUTER, RouterNode.create())
          .addNode(NodeIds.CODEGEN, CodegenNode.create())
          .addNode(NodeIds.CODE_QUALITY_CHECK, CodeQualityCheckNode.create())
          .addNode(NodeIds.PROJECT_BUILD, ProjectBuildNode.create())
          .addEdge(START, NodeIds.PROMPT_ENHANCE)
          .addEdge(NodeIds.PROMPT_ENHANCE, NodeIds.ROUTER)
          .addEdge(NodeIds.ROUTER, NodeIds.CODEGEN)
          .addEdge(NodeIds.CODEGEN, NodeIds.CODE_QUALITY_CHECK)
          .addConditionalEdges(
              NodeIds.CODE_QUALITY_CHECK,
              edge_async(this::routeAfterQualityCheck),
              Map.of(
                  Conditions.BUILD, NodeIds.PROJECT_BUILD, // Code quality check passed, build required
                  Conditions.SKIP_BUILD, END, // Code quality check passed, skip build
                  Conditions.FAILED, NodeIds.CODEGEN // Code quality check failed, regenerate
                  ))
          .addEdge(NodeIds.PROJECT_BUILD, END)
          .compile();
    } catch (GraphStateException e) {
      throw new BusinessException(ErrorCode.OPERATION_FAILED, "Codegen workflow: creation failed");
    }
  }

  public WorkflowContext executeWorkflow(String originalPrompt) {
    var workflow = createWorkflow();
    var initialContext =
        WorkflowContext.builder()
            .originalPrompt(originalPrompt)
            .currentStep("Codegen workflow: initializing")
            .build();
    var graph = workflow.getGraph(GraphRepresentation.Type.MERMAID);
    log.info("Codegen workflow graph:\n{}", graph.content());
    log.info("Codegen workflow: starting execution");
    WorkflowContext finalContext = null;
    var stepNumber = 1;
    for (var step : workflow.stream(Map.of(WorkflowContext.WORKFLOW_CONTEXT_KEY, initialContext))) {
      log.info("Codegen workflow: step {} completed", stepNumber);
      var currentContext = WorkflowContext.getContext(step.state());
      if (currentContext != null) {
        finalContext = currentContext;
        log.info("Codegen workflow: current context {}", currentContext);
      }
      stepNumber++;
    }
    log.info("Codegen workflow: execution completed");
    return finalContext;
  }

  public Flux<String> executeWorkflowWithFlux(String originalPrompt) {
    return Flux.create(
        sink -> {
          Thread.startVirtualThread(
              () -> {
                try {
                  var workflow = createWorkflow();
                  var initialContext =
                      WorkflowContext.builder()
                          .originalPrompt(originalPrompt)
                          .currentStep("Codegen workflow: initializing")
                          .build();
                  sink.next(
                      formatSseEvent(
                          EventNames.WORKFLOW_START,
                          Map.of("message", "Codegen workflow: starting execution", "original_prompt", originalPrompt)));
                  var graph = workflow.getGraph(GraphRepresentation.Type.MERMAID);
                  log.info("Codegen workflow graph:\n{}", graph.content());
                  var stepNumber = 1;
                  for (var step :
                      workflow.stream(
                          Map.of(WorkflowContext.WORKFLOW_CONTEXT_KEY, initialContext))) {
                    log.info("Codegen workflow: step {} completed", stepNumber);
                    var currentContext = WorkflowContext.getContext(step.state());
                    if (currentContext != null) {
                      sink.next(
                          formatSseEvent(
                              EventNames.STEP_COMPLETE,
                              Map.of(
                                  "step_number",
                                  stepNumber,
                                  "current_step",
                                  currentContext.getCurrentStep())));
                      log.info("Codegen workflow: current context {}", currentContext);
                    }
                    stepNumber++;
                  }
                  sink.next(
                      formatSseEvent(
                          EventNames.WORKFLOW_COMPLETE, Map.of("message", "Codegen workflow completed")));
                  log.info("Codegen workflow: execution completed");
                  sink.complete();
                } catch (Exception e) {
                  log.error("Codegen workflow: execution failed {}", e.getMessage(), e);
                  sink.next(
                      formatSseEvent(
                          EventNames.WORKFLOW_ERROR,
                          Map.of("error", e.getMessage(), "message", "Codegen workflow: execution failed")));
                  sink.error(e);
                }
              });
        });
  }

  public SseEmitter executeWorkflowWithSse(String originalPrompt) {
    var emitter = new SseEmitter(30 * 60 * 1000L);
    Thread.startVirtualThread(
        () -> {
          try {
            var workflow = createWorkflow();
            var initialContext =
                WorkflowContext.builder()
                    .originalPrompt(originalPrompt)
                    .currentStep("Codegen workflow: initializing")
                    .build();
            sendSseEvent(
                emitter,
                EventNames.WORKFLOW_START,
                Map.of("message", "Codegen workflow: starting execution", "original_prompt", originalPrompt));
            var graph = workflow.getGraph(GraphRepresentation.Type.MERMAID);
            log.info("Codegen workflow graph:\n{}", graph.content());
            log.info("Codegen workflow: starting execution");
            var stepNumber = 1;
            for (var step :
                workflow.stream(Map.of(WorkflowContext.WORKFLOW_CONTEXT_KEY, initialContext))) {
              log.info("Codegen workflow: step {} completed", stepNumber);
              var currentContext = WorkflowContext.getContext(step.state());
              if (currentContext != null) {
                sendSseEvent(
                    emitter,
                    EventNames.STEP_COMPLETE,
                    Map.of(
                        "step_number",
                        stepNumber,
                        "current_step",
                        currentContext.getCurrentStep()));
                log.info("Codegen workflow: current context {}", currentContext);
              }
              stepNumber++;
            }
            sendSseEvent(emitter, EventNames.STEP_COMPLETE, Map.of("message", "Codegen workflow: execution completed"));
            log.info("Codegen workflow: execution completed");
            emitter.complete();
          } catch (Exception e) {
            log.error("Codegen workflow: execution failed: {}", e.getMessage(), e);
            sendSseEvent(
                emitter,
                EventNames.WORKFLOW_ERROR,
                Map.of("error", e.getMessage(), "message", "Codegen workflow: execution failed"));
            emitter.completeWithError(e);
          }
        });
    return emitter;
  }

  private String formatSseEvent(String eventType, Object data) {
    try {
      var jsonData = JSONUtil.toJsonStr(data);
      return "event: " + eventType + "\ndata: " + jsonData + "\n\n";
    } catch (Exception e) {
      log.error("Failed to format SSE event: {}", e.getMessage(), e);
      return "event: error\ndata: {\"error\":\"Failed to format SSE event\"}\n\n";
    }
  }

  private void sendSseEvent(SseEmitter emitter, String eventType, Object data) {
    try {
      emitter.send(SseEmitter.event().name(eventType).data(data));
    } catch (IOException e) {
      log.error("Failed to send SSE event: {}", e.getMessage(), e);
    }
  }

  private String routeAfterQualityCheck(MessagesState<String> state) {
    var context = WorkflowContext.getContext(state);
    var codeQualityResult = context.getCodeQualityResult();
    if (codeQualityResult == null || !codeQualityResult.getIsPassed()) {
      log.error("Code quality check failed, regenerating code");
      return Conditions.FAILED;
    }
    log.info("Code quality check passed, proceeding");
    var codegenType = context.getCodegenType();
    if (codegenType == CodegenType.VANILLA_HTML || codegenType == CodegenType.MULTI_FILES) {
      return Conditions.SKIP_BUILD;
    }
    // codegenType == CodegenType.VITE_PROJECT
    return Conditions.BUILD;
  }
}
