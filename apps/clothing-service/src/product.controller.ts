import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('catalog')
  async getCatalog(@Query('enabled') enabled?: string) {
    const isEnabled = enabled === 'true' ? true : undefined;
    return this.productService.getProducts(isEnabled);
  }

  @Get(':code')
  async getProduct(@Param('code') code: string) {
    return this.productService.getProduct(code);
  }

  @Post()
  async createItem(@Body() data: {
    product_code: string;
    name: string;
    description?: string;
    preview_image?: string;
    price: number;
    stock_count: number;
    is_enabled?: boolean;
  }) {
    return this.productService.createProduct(data);
  }

  @Put(':code')
  async updateItem(@Param('code') code: string, @Body() data: any) {
    return this.productService.updateProduct(code, data);
  }

  @Delete(':code')
  async deleteItem(@Param('code') code: string) {
    return this.productService.deleteProduct(code);
  }

  @Get(':code/availability')
  async checkAvailability(
    @Param('code') code: string,
    @Query('quantity') quantity?: string
  ) {
    const qty = quantity ? parseInt(quantity) : 1;
    return this.productService.checkAvailability(code, qty);
  }

  @MessagePattern({ cmd: 'product:get' })
  async handleGetProduct(data: { productCode: string }) {
    return this.productService.getProduct(data.productCode);
  }

  @MessagePattern({ cmd: 'product:check-availability' })
  async handleCheckAvailability(data: { productCode: string; quantity: number }) {
    return this.productService.checkAvailability(data.productCode, data.quantity);
  }

  @MessagePattern({ cmd: 'product:update-stock' })
  async handleUpdateStock(data: { productCode: string; quantity: number }) {
    return this.productService.updateStock(data.productCode, data.quantity);
  }
}

