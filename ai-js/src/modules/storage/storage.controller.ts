import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  HttpStatus,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { StorageService, UploadResult } from "./storage.service";
import { BaseResponse } from "../../common/base-response";
import { RequireLogin } from "../../common/decorators/auth.decorator";

@ApiTags("存储")
@Controller("api/storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post("upload/image")
  @RequireLogin()
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  @ApiOperation({ summary: "上传图片" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
      },
    },
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<BaseResponse<UploadResult>> {
    const result = await this.storageService.uploadImage(file);
    return BaseResponse.success(result);
  }

  @Post("upload/file")
  @RequireLogin()
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  )
  @ApiOperation({ summary: "上传文件" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<BaseResponse<UploadResult>> {
    const result = await this.storageService.uploadFile(file);
    return BaseResponse.success(result);
  }

  @Post("upload/base64")
  @RequireLogin()
  @ApiOperation({ summary: "上传 Base64 图片" })
  async uploadBase64(
    @Body("data") data: string,
    @Body("filename") filename?: string,
  ): Promise<BaseResponse<UploadResult>> {
    const result = await this.storageService.uploadBase64Image(data, filename);
    return BaseResponse.success(result);
  }

  @Delete(":key(*)")
  @RequireLogin()
  @ApiOperation({ summary: "删除文件" })
  async deleteFile(@Param("key") key: string): Promise<BaseResponse<boolean>> {
    const result = await this.storageService.deleteFile(key);
    return BaseResponse.success(result);
  }
}

/**
 * 静态文件服务控制器
 */
@Controller("storage")
export class StorageStaticController {
  constructor(private readonly storageService: StorageService) {}

  @Get("*")
  async getFile(
    @Param() params: string[],
    @Res() res: Response,
  ): Promise<void> {
    // 获取完整路径
    const key = params[0] || "";
    const file = this.storageService.getFile(key);

    if (!file) {
      res.status(HttpStatus.NOT_FOUND).json({
        code: 40400,
        message: "文件不存在",
      });
      return;
    }

    res.setHeader("Content-Type", file.mimeType);
    res.sendFile(file.path);
  }
}
