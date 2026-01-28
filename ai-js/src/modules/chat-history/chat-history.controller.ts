import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Param,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { ChatHistoryService } from "./chat-history.service";
import { ChatHistoryQueryDto } from "./dto/chat-history.dto";
import { ChatHistoryVO } from "./vo/chat-history.vo";
import { BaseResponse, PageResponse } from "../../common/base-response";
import { CurrentUser, Roles } from "../../common/decorators/auth.decorator";
import { UserRole } from "../../common/enums/user-role.enum";
import { ChatHistory } from "./entities/chat-history.entity";

@ApiTags("聊天历史")
@Controller("chatHistory")
export class ChatHistoryController {
  constructor(private readonly chatHistoryService: ChatHistoryService) {}

  /**
   * 分页查询某个应用的对话历史（游标查询）
   * 对应 Java: GET /api/chatHistory/app/{appId}
   */
  @Get("app/:appId")
  @ApiOperation({ summary: "分页获取应用对话历史（游标查询）" })
  @ApiParam({ name: "appId", description: "应用ID" })
  @ApiQuery({
    name: "pageSize",
    required: false,
    description: "每页大小，默认10",
  })
  @ApiQuery({
    name: "lastCreateTime",
    required: false,
    description: "上一页最后一条记录的创建时间",
  })
  async listAppChatHistory(
    @Param("appId") appId: string,
    @Query("pageSize") pageSize: string = "10",
    @Query("lastCreateTime") lastCreateTime?: string,
    @CurrentUser("id") userId?: string,
  ): Promise<BaseResponse<PageResponse<ChatHistory>>> {
    const page = await this.chatHistoryService.listAppChatHistoryByPage(
      appId,
      parseInt(pageSize, 10) || 10,
      lastCreateTime ? new Date(lastCreateTime) : undefined,
      userId,
    );
    return BaseResponse.success(page);
  }

  /**
   * 管理员分页查询所有对话历史
   * 对应 Java: POST /api/chatHistory/admin/list/page/vo
   */
  @Post("admin/list/page/vo")
  @Roles(UserRole.ADMIN)
  @HttpCode(200)
  @ApiOperation({ summary: "分页获取聊天历史（管理员）" })
  async listChatHistoryByPage(
    @Body() dto: ChatHistoryQueryDto,
    @CurrentUser("id") userId: string,
  ): Promise<BaseResponse<PageResponse<ChatHistoryVO>>> {
    const page = await this.chatHistoryService.listChatHistoryByPage(
      dto,
      userId,
    );
    return BaseResponse.success(page);
  }
}
