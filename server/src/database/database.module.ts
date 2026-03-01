import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from './entities/user-entity';
import { AppEntity } from './entities/app-entity';
import { ChatHistoryEntity } from './entities/chat-history-entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: Number(configService.get<number>('DB_PORT', 3306)),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', 'pass'),
        database: configService.get('DB_DATABASE', 'ai_codegen'),
        entities: [UserEntity, AppEntity, ChatHistoryEntity],
        synchronize: false,
        logging: false,
        extra: {
          supportBigNumbers: true,
          bigNumberStrings: true,
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
