import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ProductService } from './product.service';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // TODO: Remove later
  @Get('temp-get-all-products-from-db')
  @ApiOperation({
    summary: '[TESTING] Get all products',
    description: 'Returns all products including disabled ones. FOR TESTING ONLY - should be removed in production',
  })
  @ApiResponse({ status: 200, description: 'All products retrieved' })
  async getAllProductsTemp() {
    return this.productService.getAllProducts();
  }

  @Get('catalog')
  @ApiOperation({ summary: 'Get product catalog', description: 'Retrieves all products, optionally filtered by enabled status' })
  @ApiQuery({ name: 'enabled', required: false, type: 'boolean', description: 'Filter by enabled status' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getCatalog(@Query('enabled') enabled?: string) {
    const isEnabled = enabled === 'true' ? true : undefined;
    return this.productService.getProducts(isEnabled);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get product details', description: 'Retrieves detailed information about a specific product' })
  @ApiParam({ name: 'code', type: 'string', description: 'Product code', example: 'TSHIRT-001' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProduct(@Param('code') code: string) {
    return this.productService.getProduct(code);
  }

  @Post()
  @ApiOperation({ summary: 'Create new product', description: 'Adds a new product to the catalog' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        product_code: { type: 'string', example: 'TSHIRT-006' },
        name: { type: 'string', example: 'Green T-Shirt' },
        description: { type: 'string', example: 'Comfortable green cotton t-shirt' },
        preview_image: { type: 'string', example: 'https://example.com/green-tshirt.jpg' },
        price: { type: 'number', example: 29.99 },
        stock_count: { type: 'number', example: 100 },
        is_enabled: { type: 'boolean', example: true },
      },
      required: ['product_code', 'name', 'price', 'stock_count'],
    },
  })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
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
  @ApiOperation({ summary: 'Update product', description: 'Updates product information' })
  @ApiParam({ name: 'code', type: 'string', description: 'Product code' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        preview_image: { type: 'string' },
        price: { type: 'number' },
        stock_count: { type: 'number' },
        is_enabled: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateItem(@Param('code') code: string, @Body() data: any) {
    return this.productService.updateProduct(code, data);
  }

  @Delete(':code')
  @ApiOperation({ summary: 'Delete product', description: 'Removes a product from the catalog' })
  @ApiParam({ name: 'code', type: 'string', description: 'Product code' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async deleteItem(@Param('code') code: string) {
    return this.productService.deleteProduct(code);
  }

  @Get(':code/availability')
  @ApiOperation({ summary: 'Check product availability', description: 'Checks if product is available in requested quantity' })
  @ApiParam({ name: 'code', type: 'string', description: 'Product code' })
  @ApiQuery({ name: 'quantity', required: false, type: 'number', description: 'Quantity to check', example: 5 })
  @ApiResponse({ status: 200, description: 'Availability checked' })
  @ApiResponse({ status: 404, description: 'Product not found' })
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

