import { Injectable, Logger, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";
import { App } from "./entities/app.entity";
import { AppVO } from "./vo/app.vo";
import {
  AppAddDto,
  AppUpdateDto,
  AppQueryDto,
  AppDeployDto,
} from "./dto/app.dto";
import { BusinessException } from "../../common/business.exception";
import { PageResponse } from "../../common/base-response";
import { UserService } from "../user/user.service";
import { UserVO } from "../user/vo/user.vo";
import { CodeGenType } from "../../common/enums/code-gen-type.enum";
import { ChatHistoryService } from "../chat-history/chat-history.service";
import { ScreenshotService } from "../builder/screenshot.service";
import { StorageService } from "../storage/storage.service";

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  // 应用生成根目录（与 Java 版本一致）
  private readonly codeOutputRootDir = path.join(
    process.cwd(),
    "tmp",
    "code_output",
  );

  constructor(
    @InjectRepository(App)
    private appRepository: Repository<App>,
    private userService: UserService,
    @Inject(forwardRef(() => ChatHistoryService))
    private chatHistoryService: ChatHistoryService,
    private screenshotService: ScreenshotService,
    private storageService: StorageService,
  ) {}

  /**
   * 创建应用
   */
  async addApp(dto: AppAddDto, userId: string): Promise<string> {
    const app = new App();
    app.appName = dto.appName || "未命名应用";
    app.initPrompt = dto.initPrompt;
    app.codeGenType = dto.codeGenType || CodeGenType.HTML;
    app.userId = userId;

    const savedApp = await this.appRepository.save(app);
    return savedApp.id;
  }

  /**
   * 更新应用
   */
  async updateApp(dto: AppUpdateDto, userId: string): Promise<boolean> {
    const app = await this.getById(dto.id);
    if (!app) {
      throw BusinessException.notFound("应用不存在");
    }

    // 校验权限
    if (app.userId !== userId) {
      throw BusinessException.noAuth("无权限修改此应用");
    }

    if (dto.appName !== undefined) app.appName = dto.appName;
    if (dto.cover !== undefined) app.cover = dto.cover;
    if (dto.initPrompt !== undefined) app.initPrompt = dto.initPrompt;
    if (dto.codeGenType !== undefined) app.codeGenType = dto.codeGenType;
    if (dto.priority !== undefined) app.priority = dto.priority;

    await this.appRepository.save(app);
    return true;
  }

  /**
   * 删除应用（级联删除聊天历史）
   */
  async deleteApp(id: string, userId: string): Promise<boolean> {
    const app = await this.getById(id);
    if (!app) {
      throw BusinessException.notFound("应用不存在");
    }

    if (app.userId !== userId) {
      throw BusinessException.noAuth("无权限删除此应用");
    }

    // 先删除关联的对话历史
    try {
      await this.chatHistoryService.deleteByAppId(id);
    } catch (error) {
      this.logger.error(
        `删除应用关联的对话历史失败：${(error as Error).message}`,
      );
    }

    app.isDelete = 1;
    await this.appRepository.save(app);
    return true;
  }

  /**
   * 获取应用
   */
  async getById(id: string): Promise<App | null> {
    return this.appRepository.findOne({
      where: { id, isDelete: 0 },
    });
  }

  /**
   * 获取应用 VO
   */
  async getAppVO(id: string): Promise<AppVO | null> {
    const app = await this.getById(id);
    if (!app) {
      return null;
    }

    const userVO = await this.userService.getUserVO(app.userId);
    return AppVO.fromEntity(app, userVO || undefined);
  }

  /**
   * 部署应用
   */
  async deployApp(dto: AppDeployDto, userId: string): Promise<string> {
    const app = await this.getById(dto.id);
    if (!app) {
      throw BusinessException.notFound("应用不存在");
    }

    if (app.userId !== userId) {
      throw BusinessException.noAuth("无权限部署此应用");
    }

    // 生成部署 key
    const deployKey = uuidv4().replace(/-/g, "");
    app.deployKey = deployKey;
    app.deployedTime = new Date();

    await this.appRepository.save(app);

    // 构建部署 URL（与 Java 版本一致）
    const appDeployUrl = `/static/app/${deployKey}/index.html`;

    // 异步生成截图并更新应用封面
    this.generateAppScreenshotAsync(dto.id, appDeployUrl);

    return deployKey;
  }

  /**
   * 异步生成应用截图并更新封面
   */
  private generateAppScreenshotAsync(appId: string, appUrl: string): void {
    setImmediate(async () => {
      try {
        // 构建完整 URL（本地服务）
        const baseUrl = process.env.APP_BASE_URL || "http://localhost:8123";
        const fullUrl = `${baseUrl}${appUrl}`;

        this.logger.log(`开始生成应用截图: ${fullUrl}`);

        // 生成截图
        const screenshotPath =
          await this.screenshotService.generateAndSaveScreenshot(fullUrl);

        // 读取截图文件并上传
        const screenshotBuffer = fs.readFileSync(screenshotPath);
        const uploadResult = await this.storageService.uploadFile(
          {
            buffer: screenshotBuffer,
            originalname: `app_${appId}_cover.png`,
            mimetype: "image/png",
            size: screenshotBuffer.length,
          } as Express.Multer.File,
          "images",
        );

        // 更新应用封面
        await this.appRepository.update(appId, { cover: uploadResult.url });

        // 清理临时截图文件
        if (fs.existsSync(screenshotPath)) {
          fs.unlinkSync(screenshotPath);
        }

        this.logger.log(
          `应用截图生成成功: appId=${appId}, cover=${uploadResult.url}`,
        );
      } catch (error) {
        this.logger.error(
          `生成应用截图失败: appId=${appId}, error=${(error as Error).message}`,
        );
      }
    });
  }

  /**
   * 下载应用代码
   * 返回项目源码目录路径
   */
  async getAppDownloadPath(appId: string, userId: string): Promise<string> {
    const app = await this.getById(appId);
    if (!app) {
      throw BusinessException.notFound("应用不存在");
    }

    // 权限校验
    if (app.userId !== userId) {
      throw BusinessException.noAuth("无权限下载该应用代码");
    }

    const codeGenType = app.codeGenType || "html";
    const sourceDirName = `${codeGenType}_${appId}`;
    const sourceDirPath = path.join(this.codeOutputRootDir, sourceDirName);

    // 检查代码目录是否存在
    if (!fs.existsSync(sourceDirPath)) {
      throw BusinessException.notFound("应用代码不存在，请先生成代码");
    }

    return sourceDirPath;
  }

  /**
   * 分页获取我的应用
   */
  async listMyAppByPage(
    dto: AppQueryDto,
    userId: string,
  ): Promise<PageResponse<AppVO>> {
    const {
      pageNum = 1,
      pageSize = 10,
      appName,
      codeGenType,
      sortField,
      sortOrder,
    } = dto;

    const queryBuilder = this.appRepository
      .createQueryBuilder("app")
      .where("app.isDelete = :isDelete", { isDelete: 0 })
      .andWhere("app.userId = :userId", { userId });

    if (appName) {
      queryBuilder.andWhere("app.appName LIKE :appName", {
        appName: `%${appName}%`,
      });
    }
    if (codeGenType) {
      queryBuilder.andWhere("app.codeGenType = :codeGenType", { codeGenType });
    }

    // 排序
    if (sortField && sortOrder) {
      const order = sortOrder === "ascend" ? "ASC" : "DESC";
      queryBuilder.orderBy(`app.${sortField}`, order);
    } else {
      queryBuilder.orderBy("app.updateTime", "DESC");
    }

    queryBuilder.skip((pageNum - 1) * pageSize).take(pageSize);

    const [apps, total] = await queryBuilder.getManyAndCount();

    // 获取用户信息
    const userIds = [...new Set(apps.map((app) => app.userId))];
    const users = await this.userService.listByIds(userIds);
    const userMap = new Map(users.map((u) => [u.id, UserVO.fromEntity(u)]));

    const records = apps.map((app) =>
      AppVO.fromEntity(app, userMap.get(app.userId)),
    );

    return new PageResponse(records, total, pageNum, pageSize);
  }

  /**
   * 分页获取精选应用
   */
  async listGoodAppByPage(dto: AppQueryDto): Promise<PageResponse<AppVO>> {
    const { pageNum = 1, pageSize = 10, appName, codeGenType } = dto;

    const queryBuilder = this.appRepository
      .createQueryBuilder("app")
      .where("app.isDelete = :isDelete", { isDelete: 0 })
      .andWhere("app.priority > :priority", { priority: 0 });

    if (appName) {
      queryBuilder.andWhere("app.appName LIKE :appName", {
        appName: `%${appName}%`,
      });
    }
    if (codeGenType) {
      queryBuilder.andWhere("app.codeGenType = :codeGenType", { codeGenType });
    }

    queryBuilder
      .orderBy("app.priority", "DESC")
      .addOrderBy("app.updateTime", "DESC")
      .skip((pageNum - 1) * pageSize)
      .take(pageSize);

    const [apps, total] = await queryBuilder.getManyAndCount();

    // 获取用户信息
    const userIds = [...new Set(apps.map((app) => app.userId))];
    const users = await this.userService.listByIds(userIds);
    const userMap = new Map(users.map((u) => [u.id, UserVO.fromEntity(u)]));

    const records = apps.map((app) =>
      AppVO.fromEntity(app, userMap.get(app.userId)),
    );

    return new PageResponse(records, total, pageNum, pageSize);
  }

  /**
   * 更新应用代码（内部使用）
   * 保存生成的代码到文件系统，与 Java 版本保持一致
   */
  async updateAppCode(
    appId: string,
    code: string,
    codeGenType?: string,
  ): Promise<void> {
    const app = await this.getById(appId);
    if (!app) {
      throw BusinessException.notFound("应用不存在");
    }

    const genType = codeGenType || app.codeGenType || "html";

    // 构建输出目录：{codeGenType}_{appId}
    const outputDirName = `${genType}_${appId}`;
    const outputDir = path.join(this.codeOutputRootDir, outputDirName);

    // 确保目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 保存代码到 index.html
    const filePath = path.join(outputDir, "index.html");
    fs.writeFileSync(filePath, code, "utf-8");

    // 更新数据库
    if (codeGenType) {
      app.codeGenType = codeGenType;
    }

    await this.appRepository.save(app);
  }

  /**
   * 管理员删除应用（级联删除聊天历史）
   */
  async adminDeleteApp(id: string): Promise<boolean> {
    const app = await this.getById(id);
    if (!app) {
      throw BusinessException.notFound("应用不存在");
    }

    // 先删除关联的对话历史
    try {
      await this.chatHistoryService.deleteByAppId(id);
    } catch (error) {
      this.logger.error(
        `删除应用关联的对话历史失败：${(error as Error).message}`,
      );
    }

    app.isDelete = 1;
    await this.appRepository.save(app);
    return true;
  }

  /**
   * 管理员分页获取所有应用
   */
  async listAllAppByPage(dto: AppQueryDto): Promise<PageResponse<AppVO>> {
    const {
      pageNum = 1,
      pageSize = 10,
      appName,
      codeGenType,
      sortField,
      sortOrder,
    } = dto;

    const queryBuilder = this.appRepository
      .createQueryBuilder("app")
      .where("app.isDelete = :isDelete", { isDelete: 0 });

    if (appName) {
      queryBuilder.andWhere("app.appName LIKE :appName", {
        appName: `%${appName}%`,
      });
    }
    if (codeGenType) {
      queryBuilder.andWhere("app.codeGenType = :codeGenType", { codeGenType });
    }

    // 排序
    if (sortField && sortOrder) {
      const order = sortOrder === "ascend" ? "ASC" : "DESC";
      queryBuilder.orderBy(`app.${sortField}`, order);
    } else {
      queryBuilder.orderBy("app.updateTime", "DESC");
    }

    queryBuilder.skip((pageNum - 1) * pageSize).take(pageSize);

    const [apps, total] = await queryBuilder.getManyAndCount();

    // 获取用户信息
    const userIds = [...new Set(apps.map((app) => app.userId))];
    const users = await this.userService.listByIds(userIds);
    const userMap = new Map(users.map((u) => [u.id, UserVO.fromEntity(u)]));

    const records = apps.map((app) =>
      AppVO.fromEntity(app, userMap.get(app.userId)),
    );

    return new PageResponse(records, total, pageNum, pageSize);
  }
}
