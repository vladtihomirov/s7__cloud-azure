import { Controller, Post, Body, Param } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ReturnService } from './return.service';

@Controller('returns')
export class ReturnController {
  constructor(private readonly returnService: ReturnService) {}

  @Post('request')
  async requestReturn(@Body() data: { orderId: string; reason?: string }) {
    return this.returnService.processReturn(data.orderId, data.reason);
  }

  @Post(':orderId/approve')
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

