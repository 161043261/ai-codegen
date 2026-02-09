import { ChatHistoryEntity } from '../../database/entities/chat-history.entity';

export class ChatHistoryVo {
  id: string;
  message: string;
  messageType: string;
  appId: string;
  userId: string;
  createTime: Date;

  static fromEntity(entity: ChatHistoryEntity): ChatHistoryVo | null {
    if (!entity) return null;
    const vo = new ChatHistoryVo();
    vo.id = String(entity.id);
    vo.message = entity.message;
    vo.messageType = entity.messageType;
    vo.appId = String(entity.appId);
    vo.userId = String(entity.userId);
    vo.createTime = entity.createTime;
    return vo;
  }
}
