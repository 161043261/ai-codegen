import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChatHistory } from "./entities/chat-history.entity";
import { ChatHistoryVO } from "./vo/chat-history.vo";
import { ChatHistoryAddDto, ChatHistoryQueryDto } from "./dto/chat-history.dto";
import { PageResponse } from "../../common/base-response";
import { UserService } from "../user/user.service";
import { UserVO } from "../user/vo/user.vo";

@Injectable()
export class ChatHistoryService {
  constructor(
    @InjectRepository(ChatHistory)
    private chatHistoryRepository: Repository<ChatHistory>,
    private userService: UserService,
  ) {}

  /**
   * 添加聊天历史
   */
  async addChatHistory(
    dto: ChatHistoryAddDto,
    userId: string,
  ): Promise<string> {
    const chatHistory = new ChatHistory();
    chatHistory.message = dto.message;
    chatHistory.messageType = dto.messageType;
    chatHistory.appId = dto.appId;
    chatHistory.userId = userId;

    const saved = await this.chatHistoryRepository.save(chatHistory);
    return saved.id;
  }

  /**
   * 根据应用ID获取聊天历史
   */
  async listChatHistoryByAppId(
    appId: string,
    limit: number = 20,
  ): Promise<ChatHistory[]> {
    return this.chatHistoryRepository
      .createQueryBuilder("history")
      .where("history.appId = :appId", { appId })
      .andWhere("history.isDelete = :isDelete", { isDelete: 0 })
      .orderBy("history.createTime", "ASC")
      .take(limit)
      .getMany();
  }

  /**
   * 分页获取聊天历史
   */
  async listChatHistoryByPage(
    dto: ChatHistoryQueryDto,
    userId: string,
  ): Promise<PageResponse<ChatHistoryVO>> {
    const {
      pageNum = 1,
      pageSize = 10,
      appId,
      messageType,
      sortField,
      sortOrder,
    } = dto;

    const queryBuilder = this.chatHistoryRepository
      .createQueryBuilder("history")
      .where("history.isDelete = :isDelete", { isDelete: 0 })
      .andWhere("history.userId = :userId", { userId });

    if (appId) {
      queryBuilder.andWhere("history.appId = :appId", { appId });
    }
    if (messageType) {
      queryBuilder.andWhere("history.messageType = :messageType", {
        messageType,
      });
    }

    // 排序
    if (sortField) {
      const order = sortOrder === "ascend" ? "ASC" : "DESC";
      queryBuilder.orderBy(`history.${sortField}`, order);
    } else {
      queryBuilder.orderBy("history.createTime", "DESC");
    }

    queryBuilder.skip((pageNum - 1) * pageSize).take(pageSize);

    const [records, total] = await queryBuilder.getManyAndCount();

    // 获取用户信息
    const userIds = [...new Set(records.map((r) => r.userId))];
    const users = await this.userService.listByIds(userIds);
    const userMap = new Map(users.map((u) => [u.id, UserVO.fromEntity(u)]));

    const voList = records.map((r) =>
      ChatHistoryVO.fromEntity(r, userMap.get(r.userId)),
    );

    return new PageResponse(voList, total, pageNum, pageSize);
  }

  /**
   * 删除应用的所有聊天历史
   */
  async deleteByAppId(appId: string): Promise<void> {
    await this.chatHistoryRepository
      .createQueryBuilder()
      .update(ChatHistory)
      .set({ isDelete: 1 })
      .where("appId = :appId", { appId })
      .execute();
  }

  /**
   * 分页查询某 APP 的对话记录（游标查询）
   * 对应 Java: ChatHistoryService.listAppChatHistoryByPage
   */
  async listAppChatHistoryByPage(
    appId: string,
    pageSize: number,
    lastCreateTime?: Date,
    userId?: string,
  ): Promise<PageResponse<ChatHistory>> {
    // 校验参数
    if (!appId) {
      throw new Error("应用ID不能为空");
    }
    if (pageSize <= 0 || pageSize > 50) {
      pageSize = 10;
    }

    const queryBuilder = this.chatHistoryRepository
      .createQueryBuilder("history")
      .where("history.appId = :appId", { appId })
      .andWhere("history.isDelete = :isDelete", { isDelete: 0 });

    // 游标查询 - 获取早于 lastCreateTime 的记录
    if (lastCreateTime) {
      queryBuilder.andWhere("history.createTime < :lastCreateTime", {
        lastCreateTime,
      });
    }

    // 按创建时间降序排列
    queryBuilder.orderBy("history.createTime", "DESC").take(pageSize);

    const [records, total] = await queryBuilder.getManyAndCount();

    return new PageResponse(records, total, 1, pageSize);
  }
}
