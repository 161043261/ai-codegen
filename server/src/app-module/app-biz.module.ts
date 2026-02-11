import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppEntity } from '../database/entities/app-entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from '../ai/ai.module';
import { ChatHistoryModule } from '../chat-history/chat-history.module';
import { ScreenshotModule } from '../screenshot/screenshot.module';
import { LocalStorageModule } from '../local-storage/local-storage.module';
import { ProjectDownloadModule } from '../project-download/project-download.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppEntity]),
    AiModule,
    ChatHistoryModule,
    ScreenshotModule,
    LocalStorageModule,
    ProjectDownloadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppBizModule {}
