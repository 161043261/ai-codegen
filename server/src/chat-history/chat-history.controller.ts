import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';
import { ChatHistoryQueryDto } from './dto/chat-history-query-dto';
import { BaseResponse } from '../common/response/base-response';
import { AuthCheck } from '../common/guards/auth.guard';
import { UserRole } from '../common/enums/user-role';

@Controller('chat-history')
export class ChatHistoryController {
  constructor(private readonly chatHistoryService: ChatHistoryService) {}

  @Get('app/:appId')
  @AuthCheck()
  async getChatHistoryByAppId(
    @Param('appId') appId: number,
    @Query('cursor') cursor?: string,
    @Query('pageSize') pageSize?: number,
  ) {
    const cursorDate = cursor ? new Date(cursor) : undefined;
    const result = await this.chatHistoryService.getChatHistoryByAppId(
      appId,
      cursorDate,
      pageSize || 20,
    );
    return BaseResponse.success(result);
  }

  @Post('admin/list/page/vo')
  @AuthCheck(UserRole.ADMIN)
  async adminListByPage(@Body() dto: ChatHistoryQueryDto) {
    const result = await this.chatHistoryService.adminListByPage(dto);
    return BaseResponse.success(result);
  }
}
