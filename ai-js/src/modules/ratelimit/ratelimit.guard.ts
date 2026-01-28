import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { RateLimitType } from "./ratelimit.interface";
import { RATE_LIMIT_KEY, RateLimitOptions } from "./ratelimit.decorator";
import { LocalRateLimiter } from "./local-rate-limiter";
import { RedisRateLimiter } from "./redis-rate-limiter";

/**
 * 限流守卫
 * 实现接口、用户、IP 级别的限流
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(
    private reflector: Reflector,
    private localRateLimiter: LocalRateLimiter,
    private redisRateLimiter: RedisRateLimiter,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取限流配置
    const rateLimitConfig = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    // 如果没有配置限流，直接放行
    if (!rateLimitConfig) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const key = this.generateKey(request, context, rateLimitConfig);

    // 选择限流器（优先使用 Redis）
    const limiter = this.redisRateLimiter.isAvailable()
      ? this.redisRateLimiter
      : this.localRateLimiter;

    const allowed = await limiter.tryAcquire(
      key,
      rateLimitConfig.limit!,
      rateLimitConfig.windowSeconds!,
    );

    if (!allowed) {
      this.logger.warn(`限流触发: ${key}`);
      throw new HttpException(
        {
          code: 42900,
          message: rateLimitConfig.message || "请求过于频繁，请稍后再试",
          data: null,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  /**
   * 生成限流 key
   */
  private generateKey(
    request: Request,
    context: ExecutionContext,
    config: RateLimitOptions,
  ): string {
    const parts: string[] = ["rate_limit"];

    // 添加自定义前缀
    if (config.keyPrefix) {
      parts.push(config.keyPrefix);
    }

    // 根据限流类型生成 key
    switch (config.type) {
      case RateLimitType.API:
        // 接口级别：类名 + 方法名
        const className = context.getClass().name;
        const methodName = context.getHandler().name;
        parts.push("api", `${className}.${methodName}`);
        break;

      case RateLimitType.USER:
        // 用户级别：用户 ID
        const userId = (request as any).user?.id;
        if (userId) {
          parts.push("user", String(userId));
        } else {
          // 未登录用户使用 IP 限流
          parts.push("ip", this.getClientIP(request));
        }
        break;

      case RateLimitType.IP:
      default:
        // IP 级别：客户端 IP
        parts.push("ip", this.getClientIP(request));
        break;
    }

    return parts.join(":");
  }

  /**
   * 获取客户端 IP
   */
  private getClientIP(request: Request): string {
    const xForwardedFor = request.headers["x-forwarded-for"];
    if (xForwardedFor) {
      const ip = Array.isArray(xForwardedFor)
        ? xForwardedFor[0]
        : xForwardedFor.split(",")[0];
      return ip.trim();
    }

    const xRealIP = request.headers["x-real-ip"];
    if (xRealIP) {
      return Array.isArray(xRealIP) ? xRealIP[0] : xRealIP;
    }

    return request.ip || request.socket.remoteAddress || "unknown";
  }
}
