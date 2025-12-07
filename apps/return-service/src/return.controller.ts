import { Controller, Post, Body, Param } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ReturnService } from './return.service';

@ApiTags('returns')
@Controller('returns')
export class ReturnController {
  constructor(private readonly returnService: ReturnService) {}

  @Post('request')
  @ApiOperation({ 
    summary: 'Request order return', 
    description: 'Processes a return request for a delivered order. Updates order status, restores stock, and processes refund to user balance.' 
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderId: { type: 'string', example: 'ORDER-001' },
        reason: { type: 'string', example: 'Product damaged during shipping' },
      },
      required: ['orderId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Return processed successfully, refund issued' })
  @ApiResponse({ status: 400, description: 'Order cannot be returned (not delivered or already returned)' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async requestReturn(@Body() data: { orderId: string; reason?: string }) {
    return this.returnService.processReturn(data.orderId, data.reason);
  }

  @Post(':orderId/approve')
  @ApiOperation({ 
    summary: 'Approve return request', 
    description: 'Admin endpoint to approve a return request' 
  })
  @ApiParam({ name: 'orderId', type: 'string', description: 'Order UUID', example: 'ORDER-001' })
  @ApiResponse({ status: 200, description: 'Return approved and processed' })
  @ApiResponse({ status: 400, description: 'Cannot approve return' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async approveReturn(@Param('orderId') orderId: string) {
    return this.returnService.approveReturn(orderId);
  }

  @MessagePattern({ cmd: 'returns:process-new-return' })
  async handleProcessReturn(data: { orderId: string; reason?: string }) {
    return this.returnService.processReturn(data.orderId, data.reason);
  }

  @MessagePattern({ cmd: 'returns:approve-return' })
  async handleApproveReturn(data: { orderId: string }) {
    return this.returnService.approveReturn(data.orderId);
  }
}

