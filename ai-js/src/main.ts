import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import session from "express-session";
import RedisStore from "connect-redis";
import { ConfigService } from "@nestjs/config";
import { CacheService } from "./modules/cache/cache.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const cacheService = app.get(CacheService);

  // Global prefix
  app.setGlobalPrefix("api");

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Session store - use Redis if available via CacheService, otherwise memory
  let sessionStore: session.Store | undefined;
  const redisClient = cacheService.getRedisClient();

  if (redisClient) {
    sessionStore = new RedisStore({
      client: redisClient,
      prefix: "yu-ai-code:sess:",
    });
    console.log("Session store: Redis");
  } else {
    console.log(
      "Session store: Memory (sessions will not persist across restarts)",
    );
  }

  app.use(
    session({
      store: sessionStore,
      secret: configService.get("SESSION_SECRET") || "default-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Yu AI Code Mother API")
    .setDescription("AI-powered code generation platform API")
    .setVersion("1.0")
    .addBearerAuth()
    .addCookieAuth("connect.sid")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/doc", app, document);

  const port = configService.get("PORT") || 8123;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
