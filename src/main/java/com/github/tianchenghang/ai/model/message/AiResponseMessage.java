package com.github.tianchenghang.ai.model.message;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class AiResponseMessage extends StreamMessage {
  private String data;

  public AiResponseMessage(String data) {
    super(StreamMessageType.AI_RESPONSE.getValue());
    this.data = data;
  }
}
