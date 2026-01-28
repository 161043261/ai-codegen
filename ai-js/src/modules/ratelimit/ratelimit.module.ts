import { Module, Global } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LocalRateLimiter } from "./local-rate-limiter";
import { RedisRateLimiter } from "./redis-rate-limiter";
import { RateLimitGuard } from "./ratelimit.guard";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [LocalRateLimiter, RedisRateLimiter, RateLimitGuard],
  exports: [LocalRateLimiter, RedisRateLimiter, RateLimitGuard],
})
export class RateLimitModule {}
