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
          log.info("执行节点: 项目构建");
          var generatedCodeDir = context.getGeneratedCodeDir();
          // var codegenType = context.getCodegenType();
          String buildResultDir;
          try {
            var viteBuilder = SpringContextUtil.getBean(ViteProjectBuilder.class);
            var ok = viteBuilder.buildProject(generatedCodeDir);
            if (ok) {
              buildResultDir = generatedCodeDir + File.separator + "dist";
              log.info("Vite 项目构建成功, dist 目录: {}", buildResultDir);
            } else {
              throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "Vite 项目构建失败");
            }
          } catch (Exception e) {
            log.error("Vite 项目构建异常: {}", e.getMessage(), e);
            buildResultDir = generatedCodeDir;
          }
          context.setCurrentStep("项目构建");
          context.setBuildResultDir(buildResultDir);
          log.info("项目构建完成, 输出目录: {}", buildResultDir);
          return WorkflowContext.setContext(context);
        });
  }
}
