import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Setup Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Receipt Processor API')
    .setDescription('API for uploading and analyzing receipts using AI')
    .setVersion('1.0')
    .addTag('Receipts')
    .build();

  // 2. Create the document
  const document = SwaggerModule.createDocument(app, config);

  // 3. Expose the Swagger UI at /api
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();