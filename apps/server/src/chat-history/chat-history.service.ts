import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, LessThan } from 'typeorm';
import { ChatHistoryEntity } from '../database/entities/chat-history-entity';
import { ChatHistoryQueryDto } from './dto/chat-history-query-dto';
import { ChatHistoryVo } from './vo/chat-history-vo';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import type { FindOptionsWhere, FindOptionsOrder } from 'typeorm';

@Injectable()
export class ChatHistoryService {
  private readonly logger = new Logger(ChatHistoryService.name);

  constructor(
    @InjectRepository(ChatHistoryEntity)
    private readonly chatHistoryRepository: Repository<ChatHistoryEntity>,
  ) {}

  async addChatHistory(
    message: string,
    messageType: string,
    appId: number,
    userId: number,
  ): Promise<void> {
    const entity = this.chatHistoryRepository.create({
      message,
      messageType,
      appId,
      userId,
    });
    await this.chatHistoryRepository.save(entity);
  }

  async getChatHistoryByAppId(
    appId: number,
    cursor?: Date,
    pageSize: number = 20,
  ): Promise<ChatHistoryVo[]> {
    const where: FindOptionsWhere<ChatHistoryEntity> = { appId, isDelete: 0 };
    if (cursor) {
      where.createTime = LessThan(cursor);
    }

    const entities = await this.chatHistoryRepository.find({
      where,
      order: { createTime: 'DESC' },
      take: pageSize,
    });

    return entities
      .reverse()
      .map((e) => ChatHistoryVo.fromEntity(e))
      .filter((v): v is ChatHistoryVo => v !== null);
  }

  async adminListByPage(
    dto: ChatHistoryQueryDto,
  ): Promise<{ records: ChatHistoryVo[]; total: number }> {
    const {
      current = 1,
      pageSize = 10,
      appId,
      userId,
      messageType,
      message,
      sortField,
      sortOrder,
    } = dto;
    const where: FindOptionsWhere<ChatHistoryEntity> = { isDelete: 0 };

    if (appId) where.appId = appId;
    if (userId) where.userId = userId;
    if (messageType) where.messageType = messageType;
    if (message) where.message = Like(`%${message}%`);

    const order: FindOptionsOrder<ChatHistoryEntity> = {};
    if (sortField && sortField in new ChatHistoryEntity()) {
      order[sortField] = sortOrder === 'ascend' ? 'ASC' : 'DESC';
    } else {
      order.createTime = 'DESC';
    }

    const [entities, total] = await this.chatHistoryRepository.findAndCount({
      where,
      order,
      skip: (current - 1) * pageSize,
      take: pageSize,
    });

    return {
      records: entities
        .map((e) => ChatHistoryVo.fromEntity(e))
        .filter((v): v is ChatHistoryVo => v !== null),
      total,
    };
  }

  async loadChatHistoryAsMessages(appId: number): Promise<BaseMessage[]> {
    const entities = await this.chatHistoryRepository.find({
      where: { appId, isDelete: 0 },
      order: { createTime: 'ASC' },
    });

    return entities.map((e) => {
      if (e.messageType === 'user') {
        return new HumanMessage(e.message);
      }
      return new AIMessage(e.message);
    });
  }
}
