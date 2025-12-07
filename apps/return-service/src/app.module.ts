import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from '@app/prisma';
import { ReturnController } from './return.controller';
import { ReturnService } from './return.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.ORDER_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.ORDER_SERVICE_TCP_PORT) || 4002,
        },
      },
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
  controllers: [ReturnController],
  providers: [ReturnService],
})
export class AppModule {}

