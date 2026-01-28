import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Res,
  Sse,
  HttpCode,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Response } from "express";
import { Observable, Subject } from "rxjs";
import { AppService } from "./app.service";
import { AiCodeGeneratorService } from "../ai/ai-code-generator.service";
import { ChatHistoryService } from "../chat-history/chat-history.service";
import {
  AppAddDto,
  AppUpdateDto,
  AppQueryDto,
  AppDeployDto,
  ChatGenCodeDto,
} from "./dto/app.dto";
import { AppVO } from "./vo/app.vo";
import { BaseResponse, PageResponse } from "../../common/base-response";
import {
  Public,
  Roles,
  CurrentUser,
} from "../../common/decorators/auth.decorator";
import { UserRole } from "../../common/enums/user-role.enum";
import { DeleteRequestDto } from "../../common/dto/page.dto";
import { BusinessException } from "../../common/business.exception";
import { MessageType } from "../chat-history/entities/chat-history.entity";

interface MessageEvent {
  data: string;
  type?: string;
}

@ApiTags("应用")
@Controller("app")
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly aiCodeGeneratorService: AiCodeGeneratorService,
    private readonly chatHistoryService: ChatHistoryService,
  ) {}

  /**
   * AI 对话生成代码（SSE 流式）
   * 数据格式与 Java 版本保持一致：{"d": "chunk"}
   */
  @Get("chat/gen/code")
  @Sse()
  @ApiOperation({ summary: "AI 对话生成代码（SSE流式）" })
  chatGenCode(
    @Query("appId") appId: string,
    @Query("message") message: string,
    @CurrentUser("id") userId: string,
  ): Observable<MessageEvent> {
    const subject = new Subject<MessageEvent>();

    (async () => {
      try {
        if (!appId || !message) {
          subject.next({ data: JSON.stringify({ error: "参数不能为空" }) });
          subject.complete();
          return;
        }

        const app = await this.appService.getById(appId);
        if (!app) {
          subject.next({ data: JSON.stringify({ error: "应用不存在" }) });
          subject.complete();
          return;
        }

        // 保存用户消息
        await this.chatHistoryService.addChatHistory(
          { message, messageType: MessageType.USER, appId },
          userId,
        );

        // 获取历史对话
        const historyResult =
          await this.chatHistoryService.listChatHistoryByAppId(appId, 10);
        const history = historyResult.map((h) => ({
          role: h.messageType as "user" | "assistant",
          content: h.message,
        }));

        // 调用 AI 生成代码
        let fullResponse = "";
        await this.aiCodeGeneratorService.generateCode(
          message,
          app.codeGenType || "html",
          history,
          app.initPrompt,
          (chunk: string) => {
            fullResponse += chunk;
            // 与 Java 版本保持一致，包装为 {"d": "chunk"} 格式
            subject.next({ data: JSON.stringify({ d: chunk }) });
          },
        );

        // 保存 AI 回复
        await this.chatHistoryService.addChatHistory(
          { message: fullResponse, messageType: MessageType.ASSISTANT, appId },
          userId,
        );

        // 更新应用代码
        if (app.codeGenType === "html") {
          const codeMatch = fullResponse.match(/```html\n([\s\S]*?)```/);
          if (codeMatch) {
            await this.appService.updateAppCode(appId, codeMatch[1]);
          }
        }

        // 发送 done 事件，与 Java 版本保持一致
        subject.next({ data: "", type: "done" });
        subject.complete();
      } catch (error) {
        subject.next({
          data: JSON.stringify({
            error: error instanceof Error ? error.message : "生成失败",
          }),
        });
        subject.complete();
      }
    })();

    return subject.asObservable();
  }

  @Post("add")
  @HttpCode(200)
  @ApiOperation({ summary: "创建应用" })
  async addApp(
    @Body() dto: AppAddDto,
    @CurrentUser("id") userId: string,
  ): Promise<BaseResponse<string>> {
    const appId = await this.appService.addApp(dto, userId);
    return BaseResponse.success(appId);
  }

  @Post("update")
  @HttpCode(200)
  @ApiOperation({ summary: "更新应用" })
  async updateApp(
    @Body() dto: AppUpdateDto,
    @CurrentUser("id") userId: string,
  ): Promise<BaseResponse<boolean>> {
    const result = await this.appService.updateApp(dto, userId);
    return BaseResponse.success(result);
  }

  @Post("delete")
  @HttpCode(200)
  @ApiOperation({ summary: "删除应用" })
  async deleteApp(
    @Body() dto: DeleteRequestDto,
    @CurrentUser("id") userId: string,
  ): Promise<BaseResponse<boolean>> {
    const result = await this.appService.deleteApp(dto.id, userId);
    return BaseResponse.success(result);
  }

  @Get("get/vo")
  @ApiOperation({ summary: "获取应用详情" })
  async getAppVO(@Query("id") id: string): Promise<BaseResponse<AppVO>> {
    if (!id) {
      throw BusinessException.paramsError("ID不能为空");
    }
    const appVO = await this.appService.getAppVO(id);
    if (!appVO) {
      throw BusinessException.notFound("应用不存在");
    }
    return BaseResponse.success(appVO);
  }

  @Post("deploy")
  @HttpCode(200)
  @ApiOperation({ summary: "部署应用" })
  async deployApp(
    @Body() dto: AppDeployDto,
    @CurrentUser("id") userId: string,
  ): Promise<BaseResponse<string>> {
    const deployKey = await this.appService.deployApp(dto, userId);
    return BaseResponse.success(deployKey);
  }

  @Get("download/:appId")
  @ApiOperation({ summary: "下载应用代码" })
  async downloadApp(@Param("appId") appId: string, @Res() res: Response) {
    const { filename, content } = await this.appService.downloadApp(appId);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"`,
    );

    if (typeof content === "string") {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(content);
    } else {
      res.setHeader("Content-Type", "application/zip");
      res.send(content);
    }
  }

  @Post("my/list/page/vo")
  @HttpCode(200)
  @ApiOperation({ summary: "分页获取我的应用" })
  async listMyAppByPage(
    @Body() dto: AppQueryDto,
    @CurrentUser("id") userId: string,
  ): Promise<BaseResponse<PageResponse<AppVO>>> {
    const page = await this.appService.listMyAppByPage(dto, userId);
    return BaseResponse.success(page);
  }

  @Post("good/list/page/vo")
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: "分页获取精选应用" })
  async listGoodAppByPage(
    @Body() dto: AppQueryDto,
  ): Promise<BaseResponse<PageResponse<AppVO>>> {
    const page = await this.appService.listGoodAppByPage(dto);
    return BaseResponse.success(page);
  }

  // ==================== 管理员接口 ====================

  @Post("admin/delete")
  @Roles(UserRole.ADMIN)
  @HttpCode(200)
  @ApiOperation({ summary: "管理员删除应用" })
  async adminDeleteApp(
    @Body() dto: DeleteRequestDto,
  ): Promise<BaseResponse<boolean>> {
    const app = await this.appService.getById(dto.id);
    if (!app) {
      throw BusinessException.notFound("应用不存在");
    }
    const result = await this.appService.adminDeleteApp(dto.id);
    return BaseResponse.success(result);
  }

  @Get("admin/get/vo")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "管理员获取应用详情" })
  async adminGetAppVO(@Query("id") id: string): Promise<BaseResponse<AppVO>> {
    if (!id) {
      throw BusinessException.paramsError("ID不能为空");
    }
    const appVO = await this.appService.getAppVO(id);
    if (!appVO) {
      throw BusinessException.notFound("应用不存在");
    }
    return BaseResponse.success(appVO);
  }

  @Post("admin/list/page/vo")
  @Roles(UserRole.ADMIN)
  @HttpCode(200)
  @ApiOperation({ summary: "管理员分页获取应用列表" })
  async adminListAppByPage(
    @Body() dto: AppQueryDto,
  ): Promise<BaseResponse<PageResponse<AppVO>>> {
    const page = await this.appService.listAllAppByPage(dto);
    return BaseResponse.success(page);
  }

  @Post("admin/update")
  @Roles(UserRole.ADMIN)
  @HttpCode(200)
  @ApiOperation({ summary: "管理员更新应用" })
  async adminUpdateApp(
    @Body() dto: AppUpdateDto,
  ): Promise<BaseResponse<boolean>> {
    const app = await this.appService.getById(dto.id);
    if (!app) {
      throw BusinessException.notFound("应用不存在");
    }

    if (dto.appName !== undefined) app.appName = dto.appName;
    if (dto.cover !== undefined) app.cover = dto.cover;
    if (dto.initPrompt !== undefined) app.initPrompt = dto.initPrompt;
    if (dto.codeGenType !== undefined) app.codeGenType = dto.codeGenType;
    if (dto.priority !== undefined) app.priority = dto.priority;

    return BaseResponse.success(true);
  }
}
