import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { App } from "./entities/app.entity";
import { UserModule } from "../user/user.module";
import { AiModule } from "../ai/ai.module";
import { ChatHistoryModule } from "../chat-history/chat-history.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([App]),
    UserModule,
    forwardRef(() => AiModule),
    forwardRef(() => ChatHistoryModule),
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
