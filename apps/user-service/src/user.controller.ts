import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() data: { name: string; email: string; address?: string }) {
    return this.userService.createUser(data);
  }

  @Get(':id')
  async getUserInfo(@Param('id') id: string) {
    return this.userService.getUser(id);
  }

  @Put(':id')
  async updateAccount(@Param('id') id: string, @Body() data: any) {
    return this.userService.updateUser(id, data);
  }

  @Get(':id/balance')
  async getUserBalance(@Param('id') id: string) {
    return this.userService.getUserBalance(id);
  }

  // Microservice message patterns
  @MessagePattern({ cmd: 'get_user' })
  async handleGetUser(data: { userId: string }) {
    return this.userService.getUser(data.userId);
  }

  @MessagePattern({ cmd: 'update_balance' })
  async handleUpdateBalance(data: { userId: string; amount: number }) {
    return this.userService.updateBalance(data.userId, data.amount);
  }

  @MessagePattern({ cmd: 'get_user_balance' })
  async handleGetUserBalance(data: { userId: string }) {
    return this.userService.getUserBalance(data.userId);
  }
}

