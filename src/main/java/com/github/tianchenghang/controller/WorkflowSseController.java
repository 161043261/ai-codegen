package com.github.tianchenghang.controller;

import com.github.tianchenghang.workflow.CodegenWorkflow;
import com.github.tianchenghang.workflow.state.WorkflowContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/workflow")
@Slf4j
public class WorkflowSseController {

  @PostMapping("/execute")
  public WorkflowContext executeWorkflow(@RequestParam String prompt) {
    log.info("同步工作流执行请求: {}", prompt);
    return new CodegenWorkflow().executeWorkflow(prompt);
  }

  @GetMapping(value = "/execute-flux", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public Flux<String> executeWorkflowWithFlux(@RequestParam String prompt) {
    log.info("Flux 工作流执行请求: {}", prompt);
    return new CodegenWorkflow().executeWorkflowWithFlux(prompt);
  }

  @GetMapping(value = "/execute-sse", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public SseEmitter executeWorkflowWithSse(@RequestParam String prompt) {
    log.info("SSE 工作流执行请求: {}", prompt);
    return new CodegenWorkflow().executeWorkflowWithSse(prompt);
  }
}
