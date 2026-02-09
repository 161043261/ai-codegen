import { Annotation } from '@langchain/langgraph';

export const WorkflowState = Annotation.Root({
  userPrompt: Annotation<string>,
  enhancedPrompt: Annotation<string>,
  codegenType: Annotation<string>,
  generatedCode: Annotation<string>,
  qualityCheckPassed: Annotation<boolean>,
  qualityCheckMessage: Annotation<string>,
  buildSuccess: Annotation<boolean>,
  appId: Annotation<string>,
  error: Annotation<string>,
});

export type WorkflowStateType = typeof WorkflowState.State;
