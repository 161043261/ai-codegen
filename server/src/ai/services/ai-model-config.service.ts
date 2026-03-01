import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatOpenAI } from '@langchain/openai';
import { ChatOllama } from '@langchain/ollama';

@Injectable()
export class AiModelConfigService {
  private readonly logger = new Logger(AiModelConfigService.name);

  constructor(private readonly configService: ConfigService) {}

  private get provider(): string {
    return this.configService.get('CHAT_MODEL_PROVIDER', 'cloud');
  }

  private get isOllama(): boolean {
    return this.provider === 'ollama';
  }

  createStreamingChatModel(): BaseChatModel {
    if (this.isOllama) {
      this.logger.log('Creating Ollama streaming chat model');
      return new ChatOllama({
        baseUrl: this.configService.get(
          'OLLAMA_BASE_URL',
          'http://localhost:11434',
        ),
        model: this.configService.get('OLLAMA_STREAMING_CHAT_MODEL', 'qwen2.5'),
        numPredict: Number(
          this.configService.get<number>(
            'OLLAMA_STREAMING_CHAT_MAX_TOKENS',
            8192,
          ),
        ),
        streaming: true,
      });
    }

    return new ChatOpenAI({
      configuration: {
        baseURL: this.configService.get('STREAMING_CHAT_MODEL_BASE_URL'),
      },
      apiKey: this.configService.get('STREAMING_CHAT_MODEL_API_KEY'),
      modelName: this.configService.get('STREAMING_CHAT_MODEL_NAME'),
      maxTokens: Number(
        this.configService.get<number>('STREAMING_CHAT_MODEL_MAX_TOKENS', 8192),
      ),
      streaming: true,
    });
  }

  createReasoningStreamingChatModel(): BaseChatModel {
    if (this.isOllama) {
      this.logger.log('Creating Ollama reasoning streaming chat model');
      return new ChatOllama({
        baseUrl: this.configService.get(
          'OLLAMA_BASE_URL',
          'http://localhost:11434',
        ),
        model: this.configService.get('OLLAMA_REASONING_CHAT_MODEL', 'qwen2.5'),
        numPredict: Number(
          this.configService.get<number>(
            'OLLAMA_REASONING_CHAT_MAX_TOKENS',
            8192,
          ),
        ),
        temperature: Number(
          this.configService.get<number>(
            'OLLAMA_REASONING_CHAT_TEMPERATURE',
            0.1,
          ),
        ),
        streaming: true,
      });
    }

    return new ChatOpenAI({
      configuration: {
        baseURL: this.configService.get(
          'REASONING_STREAMING_CHAT_MODEL_BASE_URL',
        ),
      },
      apiKey: this.configService.get('REASONING_STREAMING_CHAT_MODEL_API_KEY'),
      modelName: this.configService.get('REASONING_STREAMING_CHAT_MODEL_NAME'),
      maxTokens: Number(
        this.configService.get<number>(
          'REASONING_STREAMING_CHAT_MODEL_MAX_TOKENS',
          8192,
        ),
      ),
      temperature: Number(
        this.configService.get<number>(
          'REASONING_STREAMING_CHAT_MODEL_TEMPERATURE',
          0.1,
        ),
      ),
      streaming: true,
    });
  }

  createRouteChatModel(): BaseChatModel {
    if (this.isOllama) {
      this.logger.log('Creating Ollama route chat model');
      return new ChatOllama({
        baseUrl: this.configService.get(
          'OLLAMA_BASE_URL',
          'http://localhost:11434',
        ),
        model: this.configService.get('OLLAMA_ROUTE_CHAT_MODEL', 'qwen2.5'),
        numPredict: Number(
          this.configService.get<number>('OLLAMA_ROUTE_CHAT_MAX_TOKENS', 100),
        ),
      });
    }

    return new ChatOpenAI({
      configuration: {
        baseURL: this.configService.get('ROUTE_CHAT_MODEL_BASE_URL'),
      },
      apiKey: this.configService.get('ROUTE_CHAT_MODEL_API_KEY'),
      modelName: this.configService.get('ROUTE_CHAT_MODEL_NAME'),
      maxTokens: Number(
        this.configService.get<number>('ROUTE_CHAT_MODEL_MAX_TOKENS', 100),
      ),
    });
  }
}
