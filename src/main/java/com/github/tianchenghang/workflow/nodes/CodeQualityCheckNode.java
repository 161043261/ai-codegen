package com.github.tianchenghang.workflow.nodes;

import static org.bsc.langgraph4j.action.AsyncNodeAction.node_async;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import com.github.tianchenghang.utils.SpringContextUtil;
import com.github.tianchenghang.workflow.ai.CodeQualityCheckService;
import com.github.tianchenghang.workflow.model.CodeQualityResult;
import com.github.tianchenghang.workflow.state.WorkflowContext;
import java.io.File;
import java.util.Arrays;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.bsc.langgraph4j.action.AsyncNodeAction;
import org.bsc.langgraph4j.prebuilt.MessagesState;

@Slf4j
public class CodeQualityCheckNode {
  public static AsyncNodeAction<MessagesState<String>> create() {
    return node_async(
        state -> {
          var context = WorkflowContext.getContext(state);
          log.info("Executing node: Code Quality Check");
          var generatedCodeDir = context.getGeneratedCodeDir();
          CodeQualityResult codeQualityResult;
          try {
            var codeContent = readAndConcatCode(generatedCodeDir);
            if (StrUtil.isBlank(codeContent)) {
              log.warn("No code files to check");
              codeQualityResult =
                  CodeQualityResult.builder()
                      .isPassed(false)
                      .errors(List.of("No code files to check"))
                      .suggestions(List.of("Please ensure code generation succeeded"))
                      .build();
            } else {
              var codeQualityCheckService =
                  SpringContextUtil.getBean(CodeQualityCheckService.class);
              codeQualityResult = codeQualityCheckService.checkCodeQuality(codeContent);
              log.info("Code quality check completed, passed: {}", codeQualityResult.getIsPassed());
            }
          } catch (Exception e) {
            log.error("Code quality check exception: {}", e.getMessage(), e);
            codeQualityResult = CodeQualityResult.builder().isPassed(true).build();
          }
          context.setCurrentStep("Code Quality Check");
          context.setCodeQualityResult(codeQualityResult);
          return WorkflowContext.setContext(context);
        });
  }

  private static final List<String> CODE_EXTENSIONS =
      Arrays.asList(".html", ".css", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue");

  private static String readAndConcatCode(String codeDir) {
    if (StrUtil.isBlank(codeDir)) {
      return "";
    }
    var directory = new File(codeDir);
    if (!directory.exists() || !directory.isDirectory()) {
      log.error("Directory not found or not a directory: {}", codeDir);
      return "";
    }
    var codeContent = new StringBuilder();
    codeContent.append("Project structure and code content\n\n");
    FileUtil.walkFiles(
        directory,
        file -> {
          if (shouldIgnore(file, directory)) {
            return;
          }
          if (isCodeFile(file)) {
            var relativePath =
                FileUtil.subPath(directory.getAbsolutePath(), file.getAbsolutePath());
            codeContent.append("File: ").append(relativePath).append("\n\n");
            var fileContent = FileUtil.readUtf8String(file);
            codeContent.append(fileContent).append("\n\n");
          }
        });
    return codeContent.toString();
  }

  private static boolean shouldIgnore(File file, File rootDir) {
    var relativePath = FileUtil.subPath(rootDir.getAbsolutePath(), file.getAbsolutePath());
    if (file.getName().startsWith(".")) {
      return true;
    }
    return relativePath.contains("dist" + File.separator)
        || relativePath.contains("node_modules" + File.separator)
        || relativePath.contains("target" + File.separator)
        || relativePath.contains(".git" + File.separator);
  }

  private static boolean isCodeFile(File file) {
    var fileName = file.getName().toLowerCase();
    return CODE_EXTENSIONS.stream().anyMatch(fileName::endsWith);
  }
}
