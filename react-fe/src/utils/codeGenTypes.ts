/**
 * Code generation type constants
 */
export const CodeGenTypeEnum = {
  HTML: 'html',
  MULTI_FILE: 'multi_file',
  VUE_PROJECT: 'vue_project',
} as const

export type CodeGenType = (typeof CodeGenTypeEnum)[keyof typeof CodeGenTypeEnum]

/**
 * Code generation type config
 */
export const CODE_GEN_TYPE_CONFIG = {
  [CodeGenTypeEnum.HTML]: {
    label: 'Native HTML Mode',
    value: CodeGenTypeEnum.HTML,
  },
  [CodeGenTypeEnum.MULTI_FILE]: {
    label: 'Native Multi-file Mode',
    value: CodeGenTypeEnum.MULTI_FILE,
  },
  [CodeGenTypeEnum.VUE_PROJECT]: {
    label: 'Vue Project Mode',
    value: CodeGenTypeEnum.VUE_PROJECT,
  },
} as const

/**
 * Code generation type options (for dropdown)
 */
export const CODE_GEN_TYPE_OPTIONS = Object.values(CODE_GEN_TYPE_CONFIG).map((config) => ({
  label: config.label,
  value: config.value,
}))

/**
 * Format code generation type
 */
export const formatCodeGenType = (type: string | undefined): string => {
  if (!type) return 'Unknown Type'

  const config = CODE_GEN_TYPE_CONFIG[type as CodeGenType]
  return config ? config.label : type
}

/**
 * Get all code generation types
 */
export const getAllCodeGenTypes = () => {
  return Object.values(CodeGenTypeEnum)
}

/**
 * Check if valid code generation type
 */
export const isValidCodeGenType = (type: string): type is CodeGenType => {
  return Object.values(CodeGenTypeEnum).includes(type as CodeGenType)
}
