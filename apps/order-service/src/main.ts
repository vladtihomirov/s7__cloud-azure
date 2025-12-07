import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  
  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Order Service API')
    .setDescription('Order processing microservice - handles order creation, status updates, and order history')
    .setVersion('1.0')
    .addTag('orders', 'Order management operations')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
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
  console.log(`Order Service Swagger docs: ${await app.getUrl()}/api`);
  console.log(`Order Service TCP is running on: ${process.env.ORDER_SERVICE_HOST}:${process.env.ORDER_SERVICE_TCP_PORT}`);
}
bootstrap();

