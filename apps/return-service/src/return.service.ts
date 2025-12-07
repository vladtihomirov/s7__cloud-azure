import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '@app/prisma';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ReturnService {
  constructor(
    @Inject('ORDER_SERVICE') private orderClient: ClientProxy,
    @Inject('USER_SERVICE') private userClient: ClientProxy,
    @Inject('CLOTHING_SERVICE') private clothingClient: ClientProxy,
  ) {}

  async processReturn(orderId: string, reason?: string) {
    const order = await firstValueFrom(
      this.orderClient.send({ cmd: 'order:get' }, { orderId })
    );

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.status !== 'DELIVERED') {
      throw new BadRequestException('Only delivered orders can be returned');
    }

    await firstValueFrom(
      this.orderClient.send(
        { cmd: 'update_order_status' },
        { orderId, status: 'RETURNED' }
      )
    );

    for (const item of order.orderItems) {
      await firstValueFrom(
        this.clothingClient.send(
          { cmd: 'product:update-stock' },
          { productCode: item.product_code, quantity: item.quantity }
        )
      );
    }

    const refundAmount = order.orderItems.reduce((total: number, item: any) => {
      return total + Number(item.product.price) * item.quantity;
    }, 0);

    await firstValueFrom(
      this.userClient.send(
        { cmd: 'update_balance' },
        { userId: order.user_id, amount: refundAmount }
      )
    );

    return {
      message: 'Return processed successfully',
      orderId,
      refundAmount,
      reason,
      processedAt: new Date(),
    };
  }

  async approveReturn(orderId: string) {
    return this.processReturn(orderId, 'Approved by admin');
  }
}

