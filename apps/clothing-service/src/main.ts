import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  
  const config = new DocumentBuilder()
    .setTitle('Clothing Service API')
    .setDescription('Product catalog microservice - manages products, inventory, and availability')
    .setVersion('1.0')
    .addTag('products', 'Product catalog operations')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
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
  console.log(`Clothing Service Swagger docs: ${await app.getUrl()}/api`);
  console.log(`Clothing Service TCP is running on: ${process.env.CLOTHING_SERVICE_HOST}:${process.env.CLOTHING_SERVICE_TCP_PORT}`);
}
bootstrap();

