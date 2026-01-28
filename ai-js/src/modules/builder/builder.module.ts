import { Module } from "@nestjs/common";
import { VueProjectBuilder } from "./vue-project-builder";
import { ProjectDownloadService } from "./project-download.service";
import { ScreenshotService } from "./screenshot.service";

@Module({
  providers: [VueProjectBuilder, ProjectDownloadService, ScreenshotService],
  exports: [VueProjectBuilder, ProjectDownloadService, ScreenshotService],
})
export class BuilderModule {}
