import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async placeOrder(@Body() data: {
    userId: string;
    items: { productCode: string; quantity: number }[];
    address?: string;
    priority?: string;
  }) {
    return this.orderService.createOrder(data);
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.orderService.getOrder(id);
  }

  @Get('user/:userId')
  async getUserOrders(@Param('userId') userId: string) {
    return this.orderService.getUserOrders(userId);
  }

  @Post(':id/status')
  async updateOrderStatus(@Param('id') id: string, @Body() data: { status: string }) {
    return this.orderService.updateOrderStatus(id, data.status);
  }

  @MessagePattern({ cmd: 'order:get' })
  async handleGetOrder(data: { orderId: string }) {
    return this.orderService.getOrder(data.orderId);
  }

  @MessagePattern({ cmd: 'update_order_status' })
  async handleUpdateOrderStatus(data: { orderId: string; status: string }) {
    return this.orderService.updateOrderStatus(data.orderId, data.status);
  }
}

