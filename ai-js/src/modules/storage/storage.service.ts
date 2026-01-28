import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as mime from "mime-types";
import { BusinessException } from "../../common/business.exception";

export interface UploadResult {
  url: string;
  key: string;
  filename: string;
  size: number;
  mimeType: string;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private storagePath: string;
  private baseUrl: string;

  constructor(private configService: ConfigService) {
    this.storagePath = this.configService.get<string>(
      "STORAGE_PATH",
      "./uploads",
    );
    this.baseUrl = this.configService.get<string>(
      "STORAGE_BASE_URL",
      "http://localhost:8123/storage",
    );
  }

  async onModuleInit() {
    // 确保存储目录存在
    await this.ensureDir(this.storagePath);
    await this.ensureDir(path.join(this.storagePath, "images"));
    await this.ensureDir(path.join(this.storagePath, "files"));
    await this.ensureDir(path.join(this.storagePath, "projects"));
  }

  private async ensureDir(dir: string): Promise<void> {
    const absolutePath = path.resolve(dir);
    if (!fs.existsSync(absolutePath)) {
      fs.mkdirSync(absolutePath, { recursive: true });
    }
  }

  /**
   * 上传文件
   */
  async uploadFile(
    file: Express.Multer.File,
    subDir: string = "files",
  ): Promise<UploadResult> {
    const ext = path.extname(file.originalname);
    const hash = crypto.createHash("md5").update(file.buffer).digest("hex");
    const filename = `${hash}${ext}`;
    const key = `${subDir}/${filename}`;
    const filePath = path.join(this.storagePath, key);

    // 确保子目录存在
    await this.ensureDir(path.dirname(filePath));

    // 写入文件
    fs.writeFileSync(filePath, file.buffer);

    return {
      url: `${this.baseUrl}/${key}`,
      key,
      filename: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  /**
   * 上传图片
   */
  async uploadImage(file: Express.Multer.File): Promise<UploadResult> {
    // 验证是否为图片
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw BusinessException.paramsError(
        "只支持 JPG、PNG、GIF、WebP、SVG 格式的图片",
      );
    }

    return this.uploadFile(file, "images");
  }

  /**
   * 上传 Base64 图片
   */
  async uploadBase64Image(
    base64Data: string,
    filename?: string,
  ): Promise<UploadResult> {
    // 解析 base64 数据
    const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      throw BusinessException.paramsError("无效的 Base64 图片数据");
    }

    const mimeType = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, "base64");

    // 获取扩展名
    const ext = mime.extension(mimeType) || "png";
    const hash = crypto.createHash("md5").update(buffer).digest("hex");
    const finalFilename = filename || `${hash}.${ext}`;
    const key = `images/${hash}.${ext}`;
    const filePath = path.join(this.storagePath, key);

    // 确保目录存在
    await this.ensureDir(path.dirname(filePath));

    // 写入文件
    fs.writeFileSync(filePath, buffer);

    return {
      url: `${this.baseUrl}/${key}`,
      key,
      filename: finalFilename,
      size: buffer.length,
      mimeType,
    };
  }

  /**
   * 保存项目文件
   */
  async saveProjectFile(
    projectId: string,
    relativePath: string,
    content: string | Buffer,
  ): Promise<string> {
    const key = `projects/${projectId}/${relativePath}`;
    const filePath = path.join(this.storagePath, key);

    // 确保目录存在
    await this.ensureDir(path.dirname(filePath));

    // 写入文件
    fs.writeFileSync(filePath, content);

    return filePath;
  }

  /**
   * 获取项目目录路径
   */
  getProjectPath(projectId: string): string {
    return path.resolve(this.storagePath, "projects", projectId);
  }

  /**
   * 删除文件
   */
  async deleteFile(key: string): Promise<boolean> {
    const filePath = path.join(this.storagePath, key);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }

    return false;
  }

  /**
   * 删除项目目录
   */
  async deleteProject(projectId: string): Promise<boolean> {
    const projectPath = this.getProjectPath(projectId);

    if (fs.existsSync(projectPath)) {
      fs.rmSync(projectPath, { recursive: true, force: true });
      return true;
    }

    return false;
  }

  /**
   * 获取文件
   */
  getFile(key: string): { path: string; mimeType: string } | null {
    const filePath = path.join(this.storagePath, key);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const mimeType = mime.lookup(filePath) || "application/octet-stream";
    return { path: filePath, mimeType };
  }

  /**
   * 检查文件是否存在
   */
  exists(key: string): boolean {
    const filePath = path.join(this.storagePath, key);
    return fs.existsSync(filePath);
  }

  /**
   * 获取存储根路径
   */
  getStoragePath(): string {
    return path.resolve(this.storagePath);
  }

  /**
   * 获取基础 URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}
