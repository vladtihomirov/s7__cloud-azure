import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { OrderService } from './order.service';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // TODO: Remove later
  @Get('temp-get-all-order-from-db')
  @ApiOperation({
    summary: '[TESTING] Get all orders',
    description: 'Returns all orders with items and user data. FOR TESTING ONLY - should be removed in production',
  })
  @ApiResponse({ status: 200, description: 'All orders retrieved' })
  async getAllOrdersTemp() {
    return this.orderService.getAllOrders();
  }

  @Post()
  @ApiOperation({ summary: 'Place a new order', description: 'Creates a new order with items, checks product availability, and updates stock' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '11111111-1111-1111-1111-111111111111' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productCode: { type: 'string', example: 'TSHIRT-001' },
              quantity: { type: 'number', example: 2 },
            },
          },
        },
        address: { type: 'string', example: '123 Main St, New York, NY 10001' },
        priority: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'], example: 'HIGH' },
      },
      required: ['userId', 'items'],
    },
  })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or insufficient stock' })
  @ApiResponse({ status: 404, description: 'User or product not found' })
  async placeOrder(@Body() data: {
    userId: string;
    items: { productCode: string; quantity: number }[];
    address?: string;
    priority?: string;
  }) {
    return this.orderService.createOrder(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details', description: 'Retrieves complete order information including items and user data' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order UUID', example: 'ORDER-001' })
  @ApiResponse({ status: 200, description: 'Order found' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrder(@Param('id') id: string) {
    return this.orderService.getOrder(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user orders', description: 'Retrieves all orders for a specific user' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Orders retrieved' })
  async getUserOrders(@Param('userId') userId: string) {
    return this.orderService.getUserOrders(userId);
  }

  @Post(':id/status')
  @ApiOperation({ summary: 'Update order status', description: 'Updates the status of an order (CREATED, PROCESSED, DELIVERED, etc.)' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['CREATED', 'PROCESSED', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'UNABLE_TO_DELIVER', 'RETURNED'],
          example: 'DELIVERED',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  @ApiResponse({ status: 404, description: 'Order not found' })
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

