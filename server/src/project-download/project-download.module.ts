import { Module } from '@nestjs/common';
import { ProjectDownloadService } from './project-download.service';

@Module({
  providers: [ProjectDownloadService],
  exports: [ProjectDownloadService],
})
export class ProjectDownloadModule {}
