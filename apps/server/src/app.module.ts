import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AppBizModule } from './app-module/app-biz.module';
import { ChatHistoryModule } from './chat-history/chat-history.module';
import { AiModule } from './ai/ai.module';
import { WorkflowModule } from './workflow/workflow.module';
import { HealthModule } from './health/health.module';
import { StaticResourceModule } from './static-resource/static-resource.module';
import { MonitorModule } from './monitor/monitor.module';
import { LocalStorageModule } from './local-storage/local-storage.module';
import { AuthGuard } from './common/guards/auth.guard';
import { GlobalExceptionFilter } from './common/exceptions/global-exception.filter';
import { BigIntSerializationInterceptor } from './common/interceptors/big-int-serialization.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 60,
      },
      {
        name: 'codegen',
        ttl: 60000,
        limit: 30,
      },
    ]),
    DatabaseModule,
    UserModule,
    AppBizModule,
    ChatHistoryModule,
    AiModule,
    WorkflowModule,
    HealthModule,
    StaticResourceModule,
    MonitorModule,
    LocalStorageModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: BigIntSerializationInterceptor,
    },
  ],
})
export class AppModule {}
