export enum CodeGenType {
  HTML = "html",
  MULTI_FILE = "multi_file",
  VUE_PROJECT = "vue_project",
}

export const CodeGenTypeInfo: Record<
  CodeGenType,
  { text: string; description: string }
> = {
  [CodeGenType.HTML]: {
    text: "原生 HTML 模式",
    description: "生成单个 HTML 文件，适合简单的静态页面",
  },
  [CodeGenType.MULTI_FILE]: {
    text: "原生多文件模式",
    description: "生成多个 HTML/CSS/JS 文件，适合中等复杂度项目",
  },
  [CodeGenType.VUE_PROJECT]: {
    text: "Vue 工程模式",
    description: "生成完整的 Vue 项目结构，适合复杂应用",
  },
};
