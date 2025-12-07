import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  
  const config = new DocumentBuilder()
    .setTitle('Return Service API')
    .setDescription('Return processing microservice - handles order returns, refunds, and stock restoration')
    .setVersion('1.0')
    .addTag('returns', 'Return management operations')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
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
  console.log(`Return Service Swagger docs: ${await app.getUrl()}/api`);
  console.log(`Return Service TCP is running on: ${process.env.RETURN_SERVICE_HOST}:${process.env.RETURN_SERVICE_TCP_PORT}`);
}
bootstrap();

