import { Injectable, Logger } from '@nestjs/common';
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  ToolMessage,
  BaseMessage,
} from '@langchain/core/messages';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AiModelConfigService } from './ai-model-config.service';
import { ChatHistoryService } from '../../chat-history/chat-history.service';
import {
  VANILLA_HTML_SYSTEM_PROMPT,
  MULTI_FILES_SYSTEM_PROMPT,
  VITE_PROJECT_SYSTEM_PROMPT,
} from '../prompts';
import { CodegenType } from '../../common/enums/codegen-type';
import { ToolManager } from '../tools/tool-manager';
import { join } from 'path';

interface CachedAiService {
  messages: BaseMessage[];
  lastAccess: number;
}

@Injectable()
export class AiCodegenService {
  private readonly logger = new Logger(AiCodegenService.name);
  private readonly serviceCache = new Map<string, CachedAiService>();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 min
  private readonly MAX_MESSAGES = 20;

  constructor(
    private readonly aiModelConfig: AiModelConfigService,
    private readonly chatHistoryService: ChatHistoryService,
  ) {
    setInterval(() => this.cleanupCache(), 5 * 60 * 1000);
  }

  async generateStream(
    appId: string,
    message: string,
    codegenType: CodegenType,
    onChunk: (chunk: string) => void,
  ): Promise<void> {
    const cacheKey = `${codegenType}_${appId}`;

    let cached = this.serviceCache.get(cacheKey);
    if (!cached) {
      const historyMessages =
        await this.chatHistoryService.loadChatHistoryAsMessages(Number(appId));
      cached = {
        messages: historyMessages,
        lastAccess: Date.now(),
      };
      this.serviceCache.set(cacheKey, cached);
    }
    cached.lastAccess = Date.now();

    const systemPrompt = this.getSystemPrompt(codegenType);
    const model = this.getModel(codegenType);

    const allMessages: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      ...cached.messages.slice(-this.MAX_MESSAGES),
      new HumanMessage(message),
    ];

    if (codegenType === CodegenType.VITE_PROJECT) {
      await this.generateWithTools(model, allMessages, appId, onChunk);
    } else {
      await this.generateSimpleStream(model, allMessages, onChunk);
    }

    cached.messages.push(new HumanMessage(message));
    if (cached.messages.length > this.MAX_MESSAGES) {
      cached.messages = cached.messages.slice(-this.MAX_MESSAGES);
    }
  }

  private async generateSimpleStream(
    model: BaseChatModel,
    messages: BaseMessage[],
    onChunk: (chunk: string) => void,
  ): Promise<void> {
    const stream = await model.stream(messages);
    for await (const chunk of stream) {
      const content = typeof chunk.content === 'string' ? chunk.content : '';
      if (content) {
        onChunk(content);
      }
    }
  }

  private async generateWithTools(
    model: BaseChatModel,
    messages: BaseMessage[],
    appId: string,
    onChunk: (chunk: string) => void,
  ): Promise<void> {
    const workDir = join(
      process.cwd(),
      'tmp',
      'code_output',
      `vite_project_${appId}`,
    );
    const tools = ToolManager.createTools(workDir);
    if (!model.bindTools) {
      throw new Error('The selected model does not support tool calling');
    }
    const modelWithTools = model.bindTools(tools);

    const currentMessages = [...messages];
    let iterations = 0;
    const maxIterations = 20;

    while (iterations < maxIterations) {
      iterations++;

      const stream = await modelWithTools.stream(currentMessages);
      let fullContent = '';
      const toolCalls: {
        id: string;
        name: string;
        args: Record<string, unknown>;
      }[] = [];

      for await (const chunk of stream) {
        const content =
          typeof chunk.content === 'string'
            ? chunk.content
            : JSON.stringify(chunk);
        if (content) {
          fullContent += content;
          onChunk(content);
        }
        if (chunk.tool_calls && chunk.tool_calls.length > 0) {
          toolCalls.push(
            ...chunk.tool_calls.map((tc) => ({
              id: tc.id ?? '',
              name: tc.name,
              args: tc.args,
            })),
          );
        }
      }

      if (toolCalls.length === 0) {
        break;
      }

      currentMessages.push(
        new AIMessage({ content: fullContent, tool_calls: toolCalls }),
      );

      for (const tc of toolCalls) {
        const matchedTool = tools.find((t) => t.name === tc.name);
        if (matchedTool) {
          onChunk(`\n[Tool: ${tc.name}] ${JSON.stringify(tc.args)}\n`);
          // TODO Unsafe assignment of an `any` value.
          const result = await matchedTool.invoke(tc.args);
          const resultStr =
            typeof result === 'string' ? result : JSON.stringify(result);
          onChunk(`[Result] ${resultStr.substring(0, 200)}\n`);
          currentMessages.push(
            new ToolMessage({
              content: resultStr,
              tool_call_id: tc.id,
            }),
          );

          if (tc.name === 'Exit') {
            return;
          }
        }
      }
    }
  }

  private getSystemPrompt(codegenType: CodegenType): string {
    switch (codegenType) {
      case CodegenType.VANILLA_HTML:
        return VANILLA_HTML_SYSTEM_PROMPT;
      case CodegenType.MULTI_FILES:
        return MULTI_FILES_SYSTEM_PROMPT;
      case CodegenType.VITE_PROJECT:
        return VITE_PROJECT_SYSTEM_PROMPT;
      default:
        return VANILLA_HTML_SYSTEM_PROMPT;
    }
  }

  private getModel(codegenType: CodegenType): BaseChatModel {
    if (codegenType === CodegenType.VITE_PROJECT) {
      return this.aiModelConfig.createReasoningStreamingChatModel();
    }
    return this.aiModelConfig.createStreamingChatModel();
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.serviceCache) {
      if (now - value.lastAccess > this.CACHE_TTL) {
        this.serviceCache.delete(key);
      }
    }
  }
}
