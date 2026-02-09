package com.github.tianchenghang.workflow.config;

import com.github.tianchenghang.workflow.CodegenWorkflow;
import org.bsc.langgraph4j.GraphStateException;
import org.bsc.langgraph4j.studio.springboot.AbstractLangGraphStudioConfig;
import org.bsc.langgraph4j.studio.springboot.LangGraphFlow;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LangGraphStudioConfig extends AbstractLangGraphStudioConfig {
  final LangGraphFlow flow;

  public LangGraphStudioConfig() throws GraphStateException {
    var workflow = new CodegenWorkflow().createWorkflow().stateGraph;
    this.flow = LangGraphFlow.builder().title("LangGraph Studio").stateGraph(workflow).build();
  }

  @Override
  public LangGraphFlow getFlow() {
    return this.flow;
  }
}
