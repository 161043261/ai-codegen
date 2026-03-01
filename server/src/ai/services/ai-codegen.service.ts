import { Injectable, Logger } from '@nestjs/common';
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  ToolMessage,
  BaseMessage,
  ToolCall,
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
import { ensureDir } from '../../common/utils/ensure-dir.util';

interface CachedAiService {
  messages: BaseMessage[];
  lastAccess: number;
}

@Injectable()
export class AiCodegenService {
  // private readonly logger = new Logger(AiCodegenService.name);
  private readonly serviceCache = new Map<string, CachedAiService>();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 min
  private readonly MAX_MESSAGES = 20;
  private readonly logger = new Logger(AiCodegenService.name);

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
      await this.generateStreamWithTools(model, allMessages, appId, onChunk);
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

  private async generateStreamWithTools(
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
    ensureDir(workDir);

    const tools = ToolManager.createTools(workDir);
    if (!model.bindTools) {
      throw new Error('The selected model does not support tool calling');
    }
    const modelWithTools = model.bindTools(tools);

    const currentMessages = [...messages];
    const stream = await modelWithTools.stream(currentMessages);
    let fullContent = '';
    const toolCalls: ToolCall[] = [];

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
          ...chunk.tool_calls.map((toolCall) => ({
            id: toolCall.id ?? crypto.randomUUID(),
            name: toolCall.name,
            args: toolCall.args,
          })),
        );
      }
    }
    this.logger.log('Generated full content', fullContent);
    this.logger.log('Tool calls', toolCalls);
    currentMessages.push(
      new AIMessage({ content: fullContent, tool_calls: toolCalls }),
    );

    for (const toolCall of toolCalls) {
      const matchedTool = tools.find((t) => t.name === toolCall.name);
      if (matchedTool) {
        try {
          const toolResult: unknown = await matchedTool.invoke(toolCall.args);
          const toolContent =
            typeof toolResult === 'string'
              ? toolResult
              : JSON.stringify(toolResult);
          onChunk(
            `\n${JSON.stringify({
              toolContent,
              toolName: toolCall.name,
              toolArgs: toolCall.args,
            })}\n\n`,
          );
          currentMessages.push(
            new ToolMessage({
              content: toolContent,
              tool_call_id: toolCall.id ?? Date.now().toString(),
              name: toolCall.name,
            }),
          );
        } catch (err) {
          this.logger.error(`Failed to invoke tool ${toolCall.name}`, err);
          onChunk(
            `${JSON.stringify({
              toolName: toolCall.name,
              toolArgs: toolCall.args,
              toolError: err instanceof Error ? err.message : String(err),
            })}\n`,
          );
        }
        if (toolCall.name === 'Exit') {
          return;
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
