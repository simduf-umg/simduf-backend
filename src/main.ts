import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter, AllExceptionsFilter } from './filters/exceptionm.filters';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Configuración CORS
  app.enableCors();

  // Configuración de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filtros de excepciones globales
  app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter());

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API SIMDUF')
    .setDescription('API para la el sistema de gestiones medicas SIMDUF')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('PORT') || 4000;
  await app.listen(port);
  console.log(`La aplicación está corriendo en: ${configService.get('URL_BASE')}`);
}
bootstrap();