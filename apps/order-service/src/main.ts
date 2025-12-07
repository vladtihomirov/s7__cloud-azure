import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: process.env.ORDER_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.ORDER_SERVICE_TCP_PORT) || 4002,
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.ORDER_SERVICE_PORT || 3002);
  
  console.log(`Order Service is running on: ${await app.getUrl()}`);
  console.log(`Order Service TCP is running on: ${process.env.ORDER_SERVICE_HOST}:${process.env.ORDER_SERVICE_TCP_PORT}`);
}
bootstrap();

