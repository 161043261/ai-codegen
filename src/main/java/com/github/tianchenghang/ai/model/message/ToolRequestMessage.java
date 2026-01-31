package com.github.tianchenghang.ai.model.message;

import dev.langchain4j.agent.tool.ToolExecutionRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ToolRequestMessage extends StreamMessage {

  private String id;

  private String name;

  private String arguments;

  public ToolRequestMessage(ToolExecutionRequest toolExecutionRequest) {
    super(StreamMessageType.TOOL_REQUEST.getValue());
    this.id = toolExecutionRequest.id();
    this.name = toolExecutionRequest.name();
    this.arguments = toolExecutionRequest.arguments();
  }
}
