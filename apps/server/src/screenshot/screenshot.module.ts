import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppEntity } from '../database/entities/app-entity';
import { ScreenshotService } from './screenshot.service';
import { LocalStorageModule } from '../local-storage/local-storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([AppEntity]), LocalStorageModule],
  providers: [ScreenshotService],
  exports: [ScreenshotService],
})
export class ScreenshotModule {}
