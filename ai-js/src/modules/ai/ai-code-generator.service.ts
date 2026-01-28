import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Ollama } from "ollama";
import OpenAI from "openai";
import { CodeGenType } from "../../common/enums/code-gen-type.enum";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

type LLMProvider = "ollama" | "openai";

@Injectable()
export class AiCodeGeneratorService {
  private readonly logger = new Logger(AiCodeGeneratorService.name);
  private ollama: Ollama;
  private openai: OpenAI | null = null;
  private provider: LLMProvider;
  private model: string;

  constructor(private configService: ConfigService) {
    // 根据 LLM_PROVIDER 环境变量决定使用哪个模型
    const llmProvider = configService
      .get<string>("LLM_PROVIDER", "ollama")
      .toLowerCase();

    // 初始化 Ollama 客户端
    const ollamaBaseUrl = configService.get(
      "OLLAMA_BASE_URL",
      "http://localhost:11434",
    );
    this.ollama = new Ollama({ host: ollamaBaseUrl });

    // 初始化 OpenAI 兼容客户端
    const openaiApiKey = configService.get("OPENAI_COMPATIBLE_API_KEY");
    if (openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: openaiApiKey,
        baseURL: configService.get(
          "OPENAI_COMPATIBLE_BASE_URL",
          "https://api.openai.com/v1",
        ),
      });
    }

    // 根据配置设置默认 provider 和 model
    if (llmProvider === "openai" && this.openai) {
      this.provider = "openai";
      this.model = configService.get(
        "OPENAI_COMPATIBLE_MODEL",
        "gpt-3.5-turbo",
      );
    } else {
      this.provider = "ollama";
      this.model = configService.get("OLLAMA_MODEL", "qwen2.5-coder:7b");
    }

    this.logger.log(`AI Provider: ${this.provider}, Model: ${this.model}`);
  }

  /**
   * 切换到云端模型
   */
  useCloudModel(): void {
    if (!this.openai) {
      throw new Error("云端模型未配置，请设置 OPENAI_COMPATIBLE_API_KEY");
    }
    this.provider = "openai";
    this.model = this.configService.get(
      "OPENAI_COMPATIBLE_MODEL",
      "gpt-3.5-turbo",
    );
    this.logger.log(`Switched to cloud model: ${this.model}`);
  }

  /**
   * 切换到本地 Ollama 模型
   */
  useLocalModel(): void {
    this.provider = "ollama";
    this.model = this.configService.get("OLLAMA_MODEL", "qwen2.5-coder:7b");
    this.logger.log(`Switched to local Ollama model: ${this.model}`);
  }

  /**
   * 生成代码（流式）
   */
  async generateCode(
    userMessage: string,
    codeGenType: string,
    history: ChatMessage[] = [],
    initPrompt?: string,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(codeGenType, initPrompt);

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: userMessage },
    ];

    if (this.provider === "ollama") {
      return this.generateWithOllama(messages, onChunk);
    } else {
      return this.generateWithOpenAI(messages, onChunk);
    }
  }

  /**
   * 使用 Ollama 生成
   */
  private async generateWithOllama(
    messages: ChatMessage[],
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    const response = await this.ollama.chat({
      model: this.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
      options: {
        temperature: 0.7,
        num_predict: 8192,
      },
    });

    let fullResponse = "";

    for await (const chunk of response) {
      const content = chunk.message?.content || "";
      if (content) {
        fullResponse += content;
        onChunk?.(content);
      }
    }

    return fullResponse;
  }

  /**
   * 使用 OpenAI 兼容 API 生成
   */
  private async generateWithOpenAI(
    messages: ChatMessage[],
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    if (!this.openai) {
      throw new Error("OpenAI client not initialized");
    }

    const stream = await this.openai.chat.completions.create({
      model: this.model,
      messages: messages as any,
      stream: true,
      temperature: 0.7,
      max_tokens: 8192,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        fullResponse += content;
        onChunk?.(content);
      }
    }

    return fullResponse;
  }

  /**
   * 路由选择代码生成类型
   */
  async routeCodeGenType(userMessage: string): Promise<CodeGenType> {
    const routingPrompt = `你是一个代码生成类型路由器。根据用户的需求，选择最合适的代码生成类型。

可选类型：
- html: 原生 HTML 模式，适合简单的静态页面、单页展示
- multi_file: 原生多文件模式，适合需要多个 HTML/CSS/JS 文件的项目
- vue_project: Vue 工程模式，适合复杂的交互式应用、需要组件化开发的项目

只需要回复类型名称（html/multi_file/vue_project），不要有其他内容。

用户需求：${userMessage}`;

    let result: string | undefined;

    if (this.provider === "ollama") {
      const response = await this.ollama.chat({
        model: this.model,
        messages: [{ role: "user", content: routingPrompt }],
        options: {
          temperature: 0,
          num_predict: 50,
        },
      });
      result = response.message?.content?.trim().toLowerCase();
    } else if (this.openai) {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: routingPrompt }],
        temperature: 0,
        max_tokens: 50,
      });
      result = response.choices[0]?.message?.content?.trim().toLowerCase();
    }

    if (result?.includes("vue_project") || result?.includes("vue")) {
      return CodeGenType.VUE_PROJECT;
    }
    if (result?.includes("multi_file") || result?.includes("multi")) {
      return CodeGenType.MULTI_FILE;
    }
    return CodeGenType.HTML;
  }

  /**
   * 获取当前使用的模型信息
   */
  getModelInfo(): { provider: LLMProvider; model: string } {
    return {
      provider: this.provider,
      model: this.model,
    };
  }

  /**
   * 列出可用的 Ollama 模型
   */
  async listOllamaModels(): Promise<string[]> {
    try {
      const response = await this.ollama.list();
      return response.models.map((m) => m.name);
    } catch (error) {
      this.logger.error("Failed to list Ollama models", error);
      return [];
    }
  }

  /**
   * 设置 Ollama 模型
   */
  setOllamaModel(model: string): void {
    this.model = model;
    this.provider = "ollama";
    this.logger.log(`Set Ollama model: ${model}`);
  }

  private buildSystemPrompt(codeGenType: string, initPrompt?: string): string {
    const basePrompt = initPrompt || "";

    switch (codeGenType) {
      case CodeGenType.HTML:
        return `${basePrompt}
你是一个专业的前端开发专家，擅长生成高质量的 HTML 代码。

要求：
1. 生成完整的、可直接运行的 HTML 文件
2. 使用现代化的 CSS 样式，美观大方
3. 代码要有良好的结构和注释
4. 使用 Tailwind CSS CDN 进行样式处理
5. 如果需要交互，使用原生 JavaScript
6. 将生成的代码包裹在 \`\`\`html 代码块中

示例格式：
\`\`\`html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>页面标题</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <!-- 内容 -->
</body>
</html>
\`\`\``;

      case CodeGenType.MULTI_FILE:
        return `${basePrompt}
你是一个专业的前端开发专家，可以生成多文件项目。

要求：
1. 为每个文件使用单独的代码块
2. 在代码块前标注文件路径，如 \`<!-- file: index.html -->\`
3. 合理拆分 HTML、CSS、JavaScript
4. 使用现代化的设计风格

示例格式：
<!-- file: index.html -->
\`\`\`html
<!DOCTYPE html>
...
\`\`\`

<!-- file: styles.css -->
\`\`\`css
...
\`\`\`

<!-- file: script.js -->
\`\`\`javascript
...
\`\`\``;

      case CodeGenType.VUE_PROJECT:
        return `${basePrompt}
你是一个专业的 Vue.js 开发专家，擅长构建 Vue 3 项目。

要求：
1. 使用 Vue 3 Composition API
2. 使用 TypeScript
3. 组件化开发，合理拆分组件
4. 使用 Tailwind CSS 或其他现代样式方案
5. 为每个文件标注路径

示例格式：
<!-- file: src/App.vue -->
\`\`\`vue
<script setup lang="ts">
// 逻辑代码
</script>

<template>
  <!-- 模板 -->
</template>

<style scoped>
/* 样式 */
</style>
\`\`\``;

      default:
        return basePrompt || "你是一个专业的代码生成助手。";
    }
  }
}
