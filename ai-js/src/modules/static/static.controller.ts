import { Controller, Get, Req, Res } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Request, Response } from "express";
import { Public } from "../../common/decorators/auth.decorator";
import * as path from "path";
import * as fs from "fs";

/**
 * 静态资源访问控制器
 * 对应 Java 版本的 StaticResourceController
 * 访问格式：http://localhost:8123/api/static/{deployKey}[/{fileName}]
 */
@ApiTags("静态资源")
@Controller("static")
export class StaticController {
  // 应用生成根目录（用于预览）
  private readonly previewRootDir = path.join(
    process.cwd(),
    "tmp",
    "code_output",
  );

  /**
   * 提供静态资源访问，支持目录重定向
   * 使用通配符匹配所有路径
   */
  @Get("*")
  @Public()
  @ApiOperation({ summary: "访问静态资源" })
  serveStaticResource(@Req() req: Request, @Res() res: Response): void {
    try {
      // 获取完整路径，移除 /api/static 前缀
      const fullPath = req.path;
      const prefix = "/api/static";
      let resourcePath = fullPath.substring(prefix.length);

      // 解析 deployKey 和文件路径
      // resourcePath 格式: /{deployKey} 或 /{deployKey}/ 或 /{deployKey}/file.html
      if (!resourcePath || resourcePath === "/") {
        res.status(404).json({
          message: "Deploy key is required",
          error: "Not Found",
          statusCode: 404,
        });
        return;
      }

      // 移除开头的斜杠
      resourcePath = resourcePath.startsWith("/")
        ? resourcePath.substring(1)
        : resourcePath;

      // 分离 deployKey 和文件路径
      const firstSlashIndex = resourcePath.indexOf("/");
      let deployKey: string;
      let filePath: string;

      if (firstSlashIndex === -1) {
        // 没有斜杠，如 /api/static/html_xxx
        // 重定向到带斜杠的 URL
        res.redirect(301, `${req.path}/`);
        return;
      }

      deployKey = resourcePath.substring(0, firstSlashIndex);
      filePath = resourcePath.substring(firstSlashIndex) || "/";

      // 默认返回 index.html
      if (filePath === "/" || filePath === "") {
        filePath = "/index.html";
      }

      // 构建完整文件路径
      const absoluteFilePath = path.join(
        this.previewRootDir,
        deployKey,
        filePath,
      );

      // 安全检查：防止路径遍历攻击
      const normalizedPath = path.normalize(absoluteFilePath);
      if (!normalizedPath.startsWith(path.normalize(this.previewRootDir))) {
        res.status(403).json({ message: "Access denied", statusCode: 403 });
        return;
      }

      // 检查文件是否存在
      if (!fs.existsSync(absoluteFilePath)) {
        res.status(404).json({
          message: `Cannot GET ${req.path}`,
          error: "Not Found",
          statusCode: 404,
        });
        return;
      }

      // 检查是否是文件
      const stat = fs.statSync(absoluteFilePath);
      if (stat.isDirectory()) {
        // 如果是目录，尝试返回 index.html
        const indexPath = path.join(absoluteFilePath, "index.html");
        if (fs.existsSync(indexPath)) {
          res.setHeader("Content-Type", "text/html; charset=UTF-8");
          res.sendFile(indexPath);
          return;
        }
        res.status(404).json({
          message: "Directory listing not supported",
          error: "Not Found",
          statusCode: 404,
        });
        return;
      }

      // 设置 Content-Type
      res.setHeader("Content-Type", this.getContentType(absoluteFilePath));
      res.sendFile(absoluteFilePath);
    } catch (error) {
      console.error("Error serving static resource:", error);
      res.status(500).json({
        message: "Internal Server Error",
        statusCode: 500,
      });
    }
  }

  /**
   * 根据文件扩展名返回带字符编码的 Content-Type
   */
  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".html": "text/html; charset=UTF-8",
      ".css": "text/css; charset=UTF-8",
      ".js": "application/javascript; charset=UTF-8",
      ".json": "application/json; charset=UTF-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
      ".ttf": "font/ttf",
      ".eot": "application/vnd.ms-fontobject",
    };
    return mimeTypes[ext] || "application/octet-stream";
  }
}
