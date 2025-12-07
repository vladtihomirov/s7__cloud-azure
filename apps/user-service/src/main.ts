import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('User Service API')
    .setDescription('User management microservice - handles user registration, authentication, and balance')
    .setVersion('1.0')
    .addTag('users', 'User management operations')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: process.env.USER_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.USER_SERVICE_TCP_PORT) || 4001,
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.USER_SERVICE_PORT || 3001);

  console.log(`User Service is running on: ${await app.getUrl()}`);
  console.log(`User Service Swagger docs: ${await app.getUrl()}/api`);
  console.log(`User Service TCP is running on: ${process.env.USER_SERVICE_HOST}:${process.env.USER_SERVICE_TCP_PORT}`);
}
bootstrap();

