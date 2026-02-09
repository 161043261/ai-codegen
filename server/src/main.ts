import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 8123);
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
      secret: configService.get('SESSION_SECRET', 'ai-codegen-session-secret'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: configService.get<number>('SESSION_MAX_AGE', 2592000000),
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

  await app.listen(port);
  console.log(
    `Application is running on: http://localhost:${port}/${apiPrefix}`,
  );
}
bootstrap();
