import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

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
  console.log(`User Service TCP is running on: ${process.env.USER_SERVICE_HOST}:${process.env.USER_SERVICE_TCP_PORT}`);
}
bootstrap();

