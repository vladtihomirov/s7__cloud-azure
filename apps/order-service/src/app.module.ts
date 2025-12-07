import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from '@app/prisma';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USER_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.USER_SERVICE_TCP_PORT) || 4001,
        },
      },
      {
        name: 'CLOTHING_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.CLOTHING_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.CLOTHING_SERVICE_TCP_PORT) || 4003,
        },
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class AppModule {}

