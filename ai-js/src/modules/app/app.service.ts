import { Injectable } from "@nestjs/common";
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

@Injectable()
export class AppService {
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
   * 删除应用
   */
  async deleteApp(id: string, userId: string): Promise<boolean> {
    const app = await this.getById(id);
    if (!app) {
      throw BusinessException.notFound("应用不存在");
    }

    if (app.userId !== userId) {
      throw BusinessException.noAuth("无权限删除此应用");
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
    return deployKey;
  }

  /**
   * 下载应用代码
   */
  async downloadApp(
    appId: string,
  ): Promise<{ filename: string; content: string | Buffer }> {
    const app = await this.getById(appId);
    if (!app) {
      throw BusinessException.notFound("应用不存在");
    }

    // 目前数据库不存储代码，返回提示
    throw BusinessException.operationError("应用代码不存在");
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
   * 管理员删除应用
   */
  async adminDeleteApp(id: string): Promise<boolean> {
    const app = await this.getById(id);
    if (!app) {
      throw BusinessException.notFound("应用不存在");
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
