import { Module, Global } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { StorageService } from "./storage.service";
import {
  StorageController,
  StorageStaticController,
} from "./storage.controller";

@Global()
@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [StorageController, StorageStaticController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
