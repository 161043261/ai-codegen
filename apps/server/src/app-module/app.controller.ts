import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppService } from './app.service';
import { AppAddDto } from './dto/app-add-dto';
import { AppUpdateDto } from './dto/app-update-dto';
import { AppDeployDto } from './dto/app-deploy-dto';
import { AppQueryDto } from './dto/app-query-dto';
import { AppAdminUpdateDto } from './dto/app-admin-update-dto';
import { DeleteRequestDto } from '../common/dto/delete-request-dto';
import { BaseResponse } from '../common/response/base-response';
import { AuthCheck } from '../common/guards/auth.guard';
import { UserRole } from '../common/enums/user-role';

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('chat/codegen')
  @AuthCheck()
  async chatCodegen(
    @Query('appId') appId: number,
    @Query('message') message: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    await this.appService.chat2codegen(appId, message, request, response);
  }

  @Post('add')
  @AuthCheck()
  async addApp(@Body() dto: AppAddDto, @Req() request: Request) {
    const id = await this.appService.addApp(dto, request);
    return BaseResponse.success(id);
  }

  @Post('deploy')
  @AuthCheck()
  async deployApp(@Body() dto: AppDeployDto, @Req() request: Request) {
    const result = await this.appService.deployApp(dto, request);
    return BaseResponse.success(result);
  }

  @Get('download/:appId')
  @AuthCheck()
  async downloadProject(
    @Param('appId') appId: number,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    await this.appService.downloadProject(appId, response, request);
  }

  @Post('update')
  @AuthCheck()
  async updateApp(@Body() dto: AppUpdateDto, @Req() request: Request) {
    const result = await this.appService.updateApp(dto, request);
    return BaseResponse.success(result);
  }

  @Post('delete')
  @AuthCheck()
  async deleteApp(@Body() dto: DeleteRequestDto, @Req() request: Request) {
    const result = await this.appService.deleteApp(dto.id, request);
    return BaseResponse.success(result);
  }

  @Get('get/vo')
  async getAppVoById(@Query('id') id: number) {
    const result = await this.appService.getAppVoById(id);
    return BaseResponse.success(result);
  }

  @Post('my/list/page/vo')
  @AuthCheck()
  async myListAppVoByPage(@Body() dto: AppQueryDto, @Req() request: Request) {
    const result = await this.appService.myListAppVoByPage(dto, request);
    return BaseResponse.success(result);
  }

  @Post('awesome/list/page/vo')
  async awesomeListAppVoByPage(@Body() dto: AppQueryDto) {
    const result = await this.appService.awesomeListAppVoByPage(dto);
    return BaseResponse.success(result);
  }

  @Post('admin/delete')
  @AuthCheck(UserRole.ADMIN)
  async adminDeleteApp(@Body() dto: DeleteRequestDto) {
    const result = await this.appService.adminDeleteApp(dto.id);
    return BaseResponse.success(result);
  }

  @Post('admin/update')
  @AuthCheck(UserRole.ADMIN)
  async adminUpdateApp(@Body() dto: AppAdminUpdateDto) {
    const result = await this.appService.adminUpdateApp(dto);
    return BaseResponse.success(result);
  }

  @Post('admin/list/page/vo')
  @AuthCheck(UserRole.ADMIN)
  async adminListAppVoByPage(@Body() dto: AppQueryDto) {
    const result = await this.appService.adminListAppVoByPage(dto);
    return BaseResponse.success(result);
  }

  @Get('admin/get/vo')
  @AuthCheck(UserRole.ADMIN)
  async adminGetAppVoById(@Query('id') id: number) {
    const result = await this.appService.getAppVoById(id);
    return BaseResponse.success(result);
  }
}
