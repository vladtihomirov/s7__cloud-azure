import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '@app/prisma';
import { firstValueFrom } from 'rxjs';

// SQL Server doesn't support enums, using string constants instead
type OrderStatus = 'CREATED' | 'PROCESSED' | 'READY_FOR_DELIVERY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'UNABLE_TO_DELIVER' | 'RETURNED';
type OrderPriority = 'HIGH' | 'MEDIUM' | 'LOW';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    @Inject('USER_SERVICE') private userClient: ClientProxy,
    @Inject('CLOTHING_SERVICE') private clothingClient: ClientProxy,
  ) {}

  async createOrder(data: {
    userId: string;
    items: { productCode: string; quantity: number }[];
    address?: string;
    priority?: string;
  }) {
    const user = await firstValueFrom(
      this.userClient.send({ cmd: 'get_user' }, { userId: data.userId })
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    for (const item of data.items) {
      const available = await firstValueFrom(
        this.clothingClient.send(
          { cmd: 'product:check-availability' },
          { productCode: item.productCode, quantity: item.quantity }
        )
      );
      if (!available) {
        throw new Error(`Product ${item.productCode} is not available in required quantity`);
      }
    }

    const order = await this.prisma.order.create({
      data: {
        user_id: data.userId,
        address: data.address || user.address,
        priority: (data.priority as OrderPriority) || 'MEDIUM',
        status: 'CREATED',
        orderItems: {
          create: data.items.map(item => ({
            product_code: item.productCode,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    for (const item of data.items) {
      await firstValueFrom(
        this.clothingClient.send(
          { cmd: 'product:update-stock' },
          { productCode: item.productCode, quantity: -item.quantity }
        )
      );
    }

    return order;
  }

  async getOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { order_id: orderId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { user_id: userId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { ts_created: 'desc' },
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    const updateData: any = { status };

    if (status === 'DELIVERED') {
      updateData.ts_delivered = new Date();
    } else if (status === 'RETURNED') {
      updateData.ts_returned = new Date();
    }

    return this.prisma.order.update({
      where: { order_id: orderId },
      data: updateData,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }
}

