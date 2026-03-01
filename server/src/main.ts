import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ensureDir } from './common/utils/ensure-dir.util';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const port = Number(configService.get<number>('PORT', 8123));
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');

  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: true,
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: true,
  });

  app.use(
    session({
      secret: configService.get('SESSION_SECRET', 'ai-codegen'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: Number(configService.get('SESSION_MAX_AGE', 2_592_000_000)),
        httpOnly: true,
        secure: false,
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );
  const staticDir = join(
    process.cwd(),
    configService.get('STORAGE_LOCAL_PATH', './static'),
  );
  app.useStaticAssets(staticDir);
  ensureDir(staticDir);
  await app.listen(port);
  console.log(
    `Application is running on: http://localhost:${port}/${apiPrefix}`,
  );
}
bootstrap().catch(console.error);
