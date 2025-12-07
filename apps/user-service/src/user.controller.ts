import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // TODO: Remove later
  @Get('temp-get-all-users')
  @ApiOperation({
    summary: '[TESTING] Get all users',
    description: 'Returns all users from database. FOR TESTING ONLY - should be removed in production',
  })
  @ApiResponse({ status: 200, description: 'All users retrieved' })
  async getAllUsersTemp() {
    return this.userService.getAllUsers();
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user', description: 'Creates a new user account with name, email, and optional address' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john.doe@email.com' },
        address: { type: 'string', example: '123 Main St, New York, NY 10001' },
      },
      required: ['name', 'email'],
    },
  })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async register(@Body() data: { name: string; email: string; address?: string }) {
    return this.userService.createUser(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user information', description: 'Retrieves user details by user ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'User UUID', example: '11111111-1111-1111-1111-111111111111' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserInfo(@Param('id') id: string) {
    return this.userService.getUser(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user account', description: 'Updates user information (name, address, balance)' })
  @ApiParam({ name: 'id', type: 'string', description: 'User UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Smith' },
        address: { type: 'string', example: '456 Oak Ave, Brooklyn, NY 11201' },
        balance: { type: 'number', example: 1500.00 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateAccount(@Param('id') id: string, @Body() data: any) {
    return this.userService.updateUser(id, data);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get user balance', description: 'Retrieves the current balance for a user' })
  @ApiParam({ name: 'id', type: 'string', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Balance retrieved' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserBalance(@Param('id') id: string) {
    return this.userService.getUserBalance(id);
  }

  @MessagePattern({ cmd: 'user:get' })
  async handleGetUser(data: { userId: string }) {
    return this.userService.getUser(data.userId);
  }

  @MessagePattern({ cmd: 'user:update-balance' })
  async handleUpdateBalance(data: { userId: string; amount: number }) {
    return this.userService.updateBalance(data.userId, data.amount);
  }

  @MessagePattern({ cmd: 'user:get-balance' })
  async handleGetUserBalance(data: { userId: string }) {
    return this.userService.getUserBalance(data.userId);
  }
}

