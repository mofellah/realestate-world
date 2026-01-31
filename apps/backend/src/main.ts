import "./setup-env";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { logger } from "@boilerplate/logger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["log", "error", "warn", "debug"],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const defaultOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
  const extraOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = Array.from(new Set([defaultOrigin, ...extraOrigins]));

  // ✅ Security: Enhanced CORS configuration
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["X-Correlation-Id"],
  });

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle("Real Estate API")
    .setDescription("API documentation for Real Estate World application")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth",
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, document);

  const port = parseInt(process.env.PORT || "3000", 10);

  await app.listen(port, "0.0.0.0");
  logger.info(`Backend server listening on port ${port}`);
  console.log(`Backend server listening on port ${port}`); // explicit console output for container logs
}

bootstrap().catch((err) => {
  logger.error("Failed to start backend", err);
  process.exit(1);
});
