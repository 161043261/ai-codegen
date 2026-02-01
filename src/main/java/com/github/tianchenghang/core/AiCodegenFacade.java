package com.github.tianchenghang.core;

import cn.hutool.json.JSONUtil;
import com.github.tianchenghang.ai.AiCodegenServiceFactory;
import com.github.tianchenghang.ai.model.message.AiResponseMessage;
import com.github.tianchenghang.ai.model.message.ToolExecuteMessage;
import com.github.tianchenghang.constants.AppConstant;
import com.github.tianchenghang.core.build.ViteProjectBuilder;
import com.github.tianchenghang.core.parser.CodeParserExecutor;
import com.github.tianchenghang.core.saver.CodeSaverExecutor;
import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import com.github.tianchenghang.model.enums.CodegenType;
import dev.langchain4j.service.TokenStream;
import jakarta.annotation.Resource;
import java.io.File;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
@Slf4j
public class AiCodegenFacade {
  @Resource private AiCodegenServiceFactory aiCodegenServiceFactory;
  @Resource private ViteProjectBuilder viteProjectBuilder;

  public File generateAndSaveCode(String userMessage, CodegenType codegenType, Long appId) {
    if (codegenType == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "代码生成类型为空");
    }
    var aiCodegenService = aiCodegenServiceFactory.getAiCodegenService(appId, codegenType);
    return switch (codegenType) {
      case VANILLA_HTML -> {
        var result = aiCodegenService.generateVanillaHtml(userMessage);
        yield CodeSaverExecutor.executeSaver(result, CodegenType.VANILLA_HTML, appId);
      }
      case MULTI_FILES -> {
        var result = aiCodegenService.generateMultiFiles(userMessage);
        yield CodeSaverExecutor.executeSaver(result, CodegenType.MULTI_FILES, appId);
      }
      default -> {
        var errorMessage = "不支持的代码生成类型: " + codegenType.getValue();
        throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, errorMessage);
      }
    };
  }

  public Flux<String> generateAndSaveCodeStream(
      String userMessage, CodegenType codegenType, Long appId) {
    if (codegenType == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "代码生成类型为空");
    }
    var aiCodegenService = aiCodegenServiceFactory.getAiCodegenService(appId, codegenType);
    return switch (codegenType) {
      case VANILLA_HTML -> {
        var codeStream = aiCodegenService.generateVanillaHtmlStream(userMessage);
        yield processCodeStream(codeStream, CodegenType.VANILLA_HTML, appId);
      }
      case MULTI_FILES -> {
        var codeStream = aiCodegenService.generateMultiFilesStream(userMessage);
        yield processCodeStream(codeStream, CodegenType.MULTI_FILES, appId);
      }
      case VITE_PROJECT -> {
        var tokenStream = aiCodegenService.generateViteProjectCodeStream(appId, userMessage);
        yield processTokenStream(tokenStream, appId);
      }
      default -> {
        var errorMessage = "不支持的代码生成类型: " + codegenType.getValue();
        throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, errorMessage);
      }
    };
  }

  private Flux<String> processCodeStream(
      Flux<String> codeStream, CodegenType codegenType, Long appId) {
    var codeBuilder = new StringBuilder();
    return codeStream
        .doOnNext(codeBuilder::append)
        .doOnComplete(
            () -> {
              try {
                var completeCode = codeBuilder.toString();
                var parsedResult = CodeParserExecutor.executeParser(completeCode, codegenType);
                var saveDir = CodeSaverExecutor.executeSaver(parsedResult, codegenType, appId);
                log.info("代码保存成功: {}", saveDir.getAbsolutePath());
              } catch (Exception e) {
                log.error("代码保存失败: {}", e.getMessage(), e);
              }
            });
  }

  private Flux<String> processTokenStream(TokenStream tokenStream, Long appId) {
    return Flux.create(
        sink -> {
          tokenStream
              .onPartialResponse(
                  (partialResponse) -> {
                    var aiResponseMessage = new AiResponseMessage(partialResponse);
                    sink.next(JSONUtil.toJsonStr(aiResponseMessage));
                  })
              .onToolExecuted(
                  (toolExecution) -> {
                    var toolExecutedMessage = new ToolExecuteMessage(toolExecution);
                    sink.next(JSONUtil.toJsonStr(toolExecutedMessage));
                  })
              .onCompleteResponse(
                  (response) -> {
                    var projectPath = AppConstant.CODE_OUTPUT_ROOT_DIR + "/vite_project_" + appId;
                    viteProjectBuilder.buildProject(projectPath);
                    sink.complete();
                  })
              .onError(
                  (error) -> {
                    error.printStackTrace();
                    log.error("代码保存失败: {}", error.getMessage(), error);
                    sink.error(error);
                  })
              .start();
        });
  }
}
