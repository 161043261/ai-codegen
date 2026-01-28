import { CodeGenType } from "../../common/enums/code-gen-type.enum";

/**
 * 图片资源类型
 */
export enum ImageCategory {
  /** 内容图片 */
  CONTENT = "content",
  /** 图表 */
  DIAGRAM = "diagram",
  /** 插图 */
  ILLUSTRATION = "illustration",
  /** Logo */
  LOGO = "logo",
}

/**
 * 图片资源
 */
export interface ImageResource {
  /** 图片 URL */
  url: string;
  /** 图片描述 */
  description: string;
  /** 图片类型 */
  category: ImageCategory;
}

/**
 * 图片收集计划
 */
export interface ImageCollectionPlan {
  /** 是否需要内容图片 */
  needContentImages: boolean;
  /** 是否需要图表 */
  needDiagrams: boolean;
  /** 是否需要插图 */
  needIllustrations: boolean;
  /** 是否需要 Logo */
  needLogo: boolean;
  /** 图片描述列表 */
  imageDescriptions: string[];
}

/**
 * 代码质量检查结果
 */
export interface QualityResult {
  /** 是否有效 */
  isValid: boolean;
  /** 错误信息 */
  errors: string[];
  /** 警告信息 */
  warnings: string[];
  /** 建议 */
  suggestions: string[];
}

/**
 * 工作流上下文
 * 在工作流节点之间传递数据
 */
export interface WorkflowContext {
  /** 原始用户提示 */
  originalPrompt: string;
  /** 增强后的提示 */
  enhancedPrompt?: string;
  /** 当前步骤名称 */
  currentStep: string;
  /** 代码生成类型 */
  generationType?: CodeGenType;
  /** 应用 ID */
  appId?: string;
  /** 用户 ID */
  userId?: string;
  /** 收集的图片资源 */
  collectedImages?: ImageResource[];
  /** 图片收集计划 */
  imageCollectionPlan?: ImageCollectionPlan;
  /** 生成的代码 */
  generatedCode?: string;
  /** 代码质量检查结果 */
  qualityResult?: QualityResult;
  /** 输出目录路径 */
  outputPath?: string;
  /** 错误信息 */
  error?: string;
  /** 重试次数 */
  retryCount?: number;
  /** 最大重试次数 */
  maxRetries?: number;
  /** 自定义数据 */
  metadata?: Record<string, unknown>;
}

/**
 * 创建初始工作流上下文
 */
export function createWorkflowContext(
  originalPrompt: string,
  options?: Partial<WorkflowContext>,
): WorkflowContext {
  return {
    originalPrompt,
    currentStep: "初始化",
    retryCount: 0,
    maxRetries: 3,
    ...options,
  };
}
