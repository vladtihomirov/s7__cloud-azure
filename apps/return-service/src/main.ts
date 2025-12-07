import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: process.env.RETURN_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.RETURN_SERVICE_TCP_PORT) || 4004,
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.RETURN_SERVICE_PORT || 3004);
  
  console.log(`Return Service is running on: ${await app.getUrl()}`);
  console.log(`Return Service TCP is running on: ${process.env.RETURN_SERVICE_HOST}:${process.env.RETURN_SERVICE_TCP_PORT}`);
}
bootstrap();

