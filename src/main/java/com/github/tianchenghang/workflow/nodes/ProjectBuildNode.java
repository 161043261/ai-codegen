package com.github.tianchenghang.workflow.nodes;

import static org.bsc.langgraph4j.action.AsyncNodeAction.node_async;

import com.github.tianchenghang.core.builder.ViteProjectBuilder;
import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import com.github.tianchenghang.utils.SpringContextUtil;
import com.github.tianchenghang.workflow.state.WorkflowContext;
import java.io.File;
import lombok.extern.slf4j.Slf4j;
import org.bsc.langgraph4j.action.AsyncNodeAction;
import org.bsc.langgraph4j.prebuilt.MessagesState;

@Slf4j
public class ProjectBuildNode {

  public static AsyncNodeAction<MessagesState<String>> create() {
    return node_async(
        state -> {
          var context = WorkflowContext.getContext(state);
          log.info("Executing node: Project Build");
          var generatedCodeDir = context.getGeneratedCodeDir();
          // var codegenType = context.getCodegenType();
          String buildResultDir;
          try {
            var viteBuilder = SpringContextUtil.getBean(ViteProjectBuilder.class);
            var ok = viteBuilder.buildProject(generatedCodeDir);
            if (ok) {
              buildResultDir = generatedCodeDir + File.separator + "dist";
              log.info("Vite project built successfully, dist directory: {}", buildResultDir);
            } else {
              throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "Vite project build failed");
            }
          } catch (Exception e) {
            log.error("Vite project build exception: {}", e.getMessage(), e);
            buildResultDir = generatedCodeDir;
          }
          context.setCurrentStep("Project Build");
          context.setBuildResultDir(buildResultDir);
          log.info("Project build completed, output directory: {}", buildResultDir);
          return WorkflowContext.setContext(context);
        });
  }
}
