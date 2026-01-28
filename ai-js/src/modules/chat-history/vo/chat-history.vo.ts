import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ChatHistory } from "../entities/chat-history.entity";
import { UserVO } from "../../user/vo/user.vo";

export class ChatHistoryVO {
  @ApiProperty({ description: "ID" })
  id: string;

  @ApiProperty({ description: "消息内容" })
  message: string;

  @ApiProperty({ description: "消息类型" })
  messageType: string;

  @ApiProperty({ description: "应用ID" })
  appId: string;

  @ApiProperty({ description: "用户ID" })
  userId: string;

  @ApiPropertyOptional({ description: "用户信息" })
  user?: UserVO;

  @ApiProperty({ description: "创建时间" })
  createTime: Date;

  static fromEntity(entity: ChatHistory, user?: UserVO): ChatHistoryVO {
    const vo = new ChatHistoryVO();
    vo.id = entity.id;
    vo.message = entity.message;
    vo.messageType = entity.messageType;
    vo.appId = entity.appId;
    vo.userId = entity.userId;
    vo.user = user;
    vo.createTime = entity.createTime;
    return vo;
  }
}
