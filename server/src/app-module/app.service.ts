import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { AppEntity } from '../database/entities/app.entity';
import { AppAddDto } from './dto/app-add.dto';
import { AppUpdateDto } from './dto/app-update.dto';
import { AppDeployDto } from './dto/app-deploy.dto';
import { AppQueryDto } from './dto/app-query.dto';
import { AppAdminUpdateDto } from './dto/app-admin-update.dto';
import { AppVo } from './vo/app.vo';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/enums/error-code.enum';
import {
  USER_LOGIN_STATE,
  AWESOME_APP_PRIORITY,
  DEPLOY_KEY_LENGTH,
} from '../common/constants';
import { AiCodegenFacade } from '../ai/core/ai-codegen-facade';
import { AiRouteService } from '../ai/services/ai-route.service';
import { ChatHistoryService } from '../chat-history/chat-history.service';
import { ScreenshotService } from '../screenshot/screenshot.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { ProjectDownloadService } from '../project-download/project-download.service';
import { CodegenType } from '../common/enums/codegen-type.enum';
import { ChatHistoryMessageType } from '../common/enums/message-type.enum';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(AppEntity)
    private readonly appRepository: Repository<AppEntity>,
    private readonly configService: ConfigService,
    private readonly aiCodegenFacade: AiCodegenFacade,
    private readonly aiRouteService: AiRouteService,
    private readonly chatHistoryService: ChatHistoryService,
    private readonly screenshotService: ScreenshotService,
    private readonly localStorageService: LocalStorageService,
    private readonly projectDownloadService: ProjectDownloadService,
  ) {}

  async addApp(dto: AppAddDto, request: Request): Promise<string> {
    const loginUser = (request.session as any)?.[USER_LOGIN_STATE];
    if (!loginUser) {
      throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
    }

    const codegenType = await this.aiRouteService.routeCodegenType(
      dto.initPrompt,
    );

    const app = this.appRepository.create({
      appName: dto.appName,
      initPrompt: dto.initPrompt,
      codegenType,
      userId: loginUser.id,
    });
    const saved = await this.appRepository.save(app);
    return String(saved.id);
  }

  async chat2codegen(
    appId: number,
    message: string,
    request: Request,
    response: Response,
  ): Promise<void> {
    const loginUser = (request.session as any)?.[USER_LOGIN_STATE];
    if (!loginUser) {
      throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
    }

    const app = await this.appRepository.findOne({
      where: { id: appId, isDelete: 0 },
    });
    if (!app) {
      throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, '应用不存在');
    }

    await this.chatHistoryService.addChatHistory(
      message,
      ChatHistoryMessageType.USER,
      appId,
      Number(loginUser.id),
    );

    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('X-Accel-Buffering', 'no');

    const collectedContent: string[] = [];

    try {
      await this.aiCodegenFacade.generateAndSaveCodeStream(
        String(appId),
        message,
        app.codegenType as CodegenType,
        (chunk: string) => {
          collectedContent.push(chunk);
          response.write(`data: ${JSON.stringify({ d: chunk })}\n\n`);
        },
      );

      if (collectedContent.length > 0) {
        await this.chatHistoryService.addChatHistory(
          collectedContent.join(''),
          ChatHistoryMessageType.AI,
          appId,
          Number(loginUser.id),
        );
      }

      response.write('event: done\ndata: \n\n');
    } catch (error) {
      this.logger.error('Code generation error', error);
      response.write(
        `event: business-error\ndata: ${JSON.stringify({ code: ErrorCode.SYSTEM_ERROR, message: error instanceof Error ? error.message : String(error) })}\n\n`,
      );
    } finally {
      response.end();
    }
  }

  async deployApp(dto: AppDeployDto, request: Request): Promise<AppVo | null> {
    const loginUser = (request.session as any)?.[USER_LOGIN_STATE];
    if (!loginUser) {
      throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
    }

    const app = await this.appRepository.findOne({
      where: { id: dto.appId, isDelete: 0 },
    });
    if (!app) {
      throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
    }
    if (String(app.userId) !== String(loginUser.id)) {
      throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
    }

    let deployKey = app.deployKey;
    if (!deployKey) {
      deployKey = this.generateDeployKey();
    }

    const codeOutputDir = path.join(
      process.cwd(),
      'tmp',
      'code_output',
      `${app.codegenType}_${app.id}`,
    );
    const deployDir = path.join(process.cwd(), 'tmp', 'code_deploy', deployKey);

    if (app.codegenType === CodegenType.VITE_PROJECT) {
      const { execSync } = await import('child_process');
      try {
        execSync('npm install', { cwd: codeOutputDir, timeout: 300000 });
        execSync('npm run build', { cwd: codeOutputDir, timeout: 300000 });
        const distDir = path.join(codeOutputDir, 'dist');
        this.copyDir(distDir, deployDir);
      } catch (err) {
        this.logger.error('Build failed', err);
        throw new BusinessException(ErrorCode.OPERATION_ERROR, '项目构建失败');
      }
    } else {
      this.copyDir(codeOutputDir, deployDir);
    }

    app.deployKey = deployKey;
    app.deployTime = new Date().toISOString();
    await this.appRepository.save(app);

    const deployHost = this.configService.get('CODEGEN_DEPLOY_HOST');
    const deployUrl = `${deployHost}/${deployKey}/index.html`;

    this.screenshotService.captureAndUpload(deployUrl, app).catch((err) => {
      this.logger.error('Screenshot failed', err);
    });

    return AppVo.fromEntity(app);
  }

  async downloadProject(
    appId: number,
    response: Response,
    request: Request,
  ): Promise<void> {
    const loginUser = (request.session as any)?.[USER_LOGIN_STATE];
    if (!loginUser) {
      throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
    }
    const app = await this.appRepository.findOne({
      where: { id: appId, isDelete: 0 },
    });
    if (!app) {
      throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
    }
    const projectDir = path.join(
      process.cwd(),
      'tmp',
      'code_output',
      `${app.codegenType}_${app.id}`,
    );
    await this.projectDownloadService.downloadAsZip(
      projectDir,
      `${app.appName || 'project'}`,
      response,
    );
  }

  async updateApp(dto: AppUpdateDto, request: Request): Promise<boolean> {
    const loginUser = (request.session as any)?.[USER_LOGIN_STATE];
    if (!loginUser) {
      throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
    }
    const app = await this.appRepository.findOne({
      where: { id: dto.id, isDelete: 0 },
    });
    if (!app) {
      throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
    }
    if (String(app.userId) !== String(loginUser.id)) {
      throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
    }
    if (dto.appName !== undefined) app.appName = dto.appName;
    await this.appRepository.save(app);
    return true;
  }

  async deleteApp(id: number, request: Request): Promise<boolean> {
    const loginUser = (request.session as any)?.[USER_LOGIN_STATE];
    if (!loginUser) {
      throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
    }
    const app = await this.appRepository.findOne({
      where: { id, isDelete: 0 },
    });
    if (!app) {
      throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
    }
    if (String(app.userId) !== String(loginUser.id)) {
      throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
    }
    app.isDelete = 1;
    await this.appRepository.save(app);
    return true;
  }

  async getAppVoById(id: number): Promise<AppVo | null> {
    const app = await this.appRepository.findOne({
      where: { id, isDelete: 0 },
    });
    if (!app) {
      throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
    }
    return AppVo.fromEntity(app);
  }

  async myListAppVoByPage(
    dto: AppQueryDto,
    request: Request,
  ): Promise<{ records: AppVo[]; total: number }> {
    const loginUser = (request.session as any)?.[USER_LOGIN_STATE];
    if (!loginUser) {
      throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
    }
    dto.userId = Number(loginUser.id);
    return this.listAppVoByPage(dto);
  }

  async awesomeListAppVoByPage(
    dto: AppQueryDto,
  ): Promise<{ records: AppVo[]; total: number }> {
    dto.priority = AWESOME_APP_PRIORITY;
    return this.listAppVoByPage(dto);
  }

  async adminDeleteApp(id: number): Promise<boolean> {
    const app = await this.appRepository.findOne({
      where: { id, isDelete: 0 },
    });
    if (!app) {
      throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
    }
    app.isDelete = 1;
    await this.appRepository.save(app);
    return true;
  }

  async adminUpdateApp(dto: AppAdminUpdateDto): Promise<boolean> {
    const app = await this.appRepository.findOne({
      where: { id: dto.id, isDelete: 0 },
    });
    if (!app) {
      throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
    }
    if (dto.appName !== undefined) app.appName = dto.appName;
    if (dto.appCover !== undefined) app.appCover = dto.appCover;
    if (dto.codegenType !== undefined) app.codegenType = dto.codegenType;
    if (dto.priority !== undefined) app.priority = dto.priority;
    await this.appRepository.save(app);
    return true;
  }

  async adminListAppVoByPage(
    dto: AppQueryDto,
  ): Promise<{ records: AppVo[]; total: number }> {
    return this.listAppVoByPage(dto);
  }

  private async listAppVoByPage(
    dto: AppQueryDto,
  ): Promise<{ records: AppVo[]; total: number }> {
    const {
      current = 1,
      pageSize = 10,
      sortField,
      sortOrder,
      id,
      appName,
      codegenType,
      userId,
      deployKey,
      priority,
      initPrompt,
    } = dto;
    const where: any = { isDelete: 0 };

    if (id) where.id = id;
    if (codegenType) where.codegenType = codegenType;
    if (userId) where.userId = userId;
    if (deployKey) where.deployKey = deployKey;
    if (priority !== undefined) where.priority = priority;
    if (appName) where.appName = Like(`%${appName}%`);
    if (initPrompt) where.initPrompt = Like(`%${initPrompt}%`);

    const order: any = {};
    if (sortField) {
      order[sortField] = sortOrder === 'ascend' ? 'ASC' : 'DESC';
    } else {
      order.createTime = 'DESC';
    }

    const [entities, total] = await this.appRepository.findAndCount({
      where,
      order,
      skip: (current - 1) * pageSize,
      take: pageSize,
    });

    return {
      records: entities
        .map((e) => AppVo.fromEntity(e))
        .filter((v): v is AppVo => v !== null),
      total,
    };
  }

  private generateDeployKey(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < DEPLOY_KEY_LENGTH; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private copyDir(src: string, dest: string): void {
    if (!fs.existsSync(src)) {
      throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, '源目录不存在');
    }
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        this.copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}
