import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'node:fs';
import { AppModule } from './app.module';
import { getFrontendCorsOrigins } from './common/cors-origins';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { requestContextMiddleware } from './common/middleware/request-context.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.use(requestContextMiddleware);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableCors({
    origin: getFrontendCorsOrigins(),
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Torneo Kiai API')
    .setDescription(
      'Combate por turnos — contrato OpenAPI para cliente y pruebas.',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const exportPath = process.env.OPENAPI_EXPORT_PATH?.trim();
  if (exportPath) {
    writeFileSync(exportPath, JSON.stringify(document, null, 2));
    await app.close();
    return;
  }

  const port = process.env.PORT ?? 4004;
  await app.listen(port);
}
void bootstrap();
