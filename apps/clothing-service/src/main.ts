import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: process.env.CLOTHING_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.CLOTHING_SERVICE_TCP_PORT) || 4003,
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.CLOTHING_SERVICE_PORT || 3003);
  
  console.log(`Clothing Service is running on: ${await app.getUrl()}`);
  console.log(`Clothing Service TCP is running on: ${process.env.CLOTHING_SERVICE_HOST}:${process.env.CLOTHING_SERVICE_TCP_PORT}`);
}
bootstrap();

