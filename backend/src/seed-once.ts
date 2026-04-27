import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    await app.get(SeedService).seed();
  } finally {
    await app.close();
  }
}

void run();
