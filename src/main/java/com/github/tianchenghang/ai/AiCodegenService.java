package com.github.tianchenghang.ai;

import com.github.tianchenghang.ai.model.MultiFilesResult;
import com.github.tianchenghang.ai.model.VanillaHtmlResult;
import dev.langchain4j.service.MemoryId;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.TokenStream;
import dev.langchain4j.service.UserMessage;
import reactor.core.publisher.Flux;

public interface AiCodegenService {

  @SystemMessage(fromResource = "prompt/codegen-vanilla-html-system-prompt.md")
  VanillaHtmlResult generateVanillaHtml(String userMessage);

  @SystemMessage(fromResource = "prompt/codegen-multi-files-system-prompt.md")
  MultiFilesResult generateMultiFiles(String userMessage);

  @SystemMessage(fromResource = "prompt/codegen-vanilla-html-system-prompt.md")
  Flux<String> generateVanillaHtmlStream(String userMessage);

  @SystemMessage(fromResource = "prompt/codegen-multi-files-system-prompt.md")
  Flux<String> generateMultiFilesStream(String userMessage);

  @SystemMessage(fromResource = "prompt/codegen-vite-project-system-prompt.md")
  TokenStream generateViteProjectCodeStream(@MemoryId long appId, @UserMessage String userMessage);
}
