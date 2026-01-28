import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "./modules/user/user.module";
import { AppModule as CodeAppModule } from "./modules/app/app.module";
import { ChatHistoryModule } from "./modules/chat-history/chat-history.module";
import { AiModule } from "./modules/ai/ai.module";
import { AuthModule } from "./modules/auth/auth.module";
import { HealthModule } from "./modules/health/health.module";
import { StorageModule } from "./modules/storage/storage.module";
import { CacheModule } from "./modules/cache/cache.module";
import { StaticModule } from "./modules/static/static.module";
import { RateLimitModule } from "./modules/ratelimit/ratelimit.module";
import { MonitorModule } from "./modules/monitor/monitor.module";
import { CoreModule } from "./modules/core/core.module";
import { BuilderModule } from "./modules/builder/builder.module";
import { WorkflowModule } from "./modules/workflow/workflow.module";

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
    }),
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get("DB_HOST", "localhost"),
        port: configService.get<number>("DB_PORT", 3306),
        username: configService.get("DB_USERNAME", "root"),
        password: configService.get("DB_PASSWORD", "123456"),
        database: configService.get("DB_DATABASE", "yu_ai_code_mother"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: false,
        logging: configService.get("NODE_ENV") === "development",
      }),
      inject: [ConfigService],
    }),
    // Global modules
    CacheModule,
    RateLimitModule,
    MonitorModule,
    // Core modules
    CoreModule,
    BuilderModule,
    // Feature modules
    StorageModule,
    AuthModule,
    UserModule,
    CodeAppModule,
    ChatHistoryModule,
    AiModule,
    HealthModule,
    StaticModule,
    WorkflowModule,
  ],
})
export class AppModule {}
