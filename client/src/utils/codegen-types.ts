/**
 * Code generation type constants
 */
export const CodegenTypeEnum = {
  HTML: "html",
  MULTI_FILE: "multi_file",
  VUE_PROJECT: "vue_project",
} as const;

export type CodegenType =
  (typeof CodegenTypeEnum)[keyof typeof CodegenTypeEnum];

/**
 * Code generation type config
 */
export const CODE_GEN_TYPE_CONFIG = {
  [CodegenTypeEnum.HTML]: {
    label: "Native HTML Mode",
    value: CodegenTypeEnum.HTML,
  },
  [CodegenTypeEnum.MULTI_FILE]: {
    label: "Native Multi-file Mode",
    value: CodegenTypeEnum.MULTI_FILE,
  },
  [CodegenTypeEnum.VUE_PROJECT]: {
    label: "Vue Project Mode",
    value: CodegenTypeEnum.VUE_PROJECT,
  },
} as const;

/**
 * Code generation type options (for dropdown)
 */
export const CODE_GEN_TYPE_OPTIONS = Object.values(CODE_GEN_TYPE_CONFIG).map(
  (config) => ({
    label: config.label,
    value: config.value,
  }),
);

/**
 * Format code generation type
 */
export const formatCodegenType = (type: string | undefined): string => {
  if (!type) return "Unknown Type";

  const config = CODE_GEN_TYPE_CONFIG[type as CodegenType];
  return config ? config.label : type;
};

/**
 * Get all code generation types
 */
export const getAllCodegenTypes = () => {
  return Object.values(CodegenTypeEnum);
};

/**
 * Check if valid code generation type
 */
export const isValidCodegenType = (type: string): type is CodegenType => {
  return Object.values(CodegenTypeEnum).includes(type as CodegenType);
};
