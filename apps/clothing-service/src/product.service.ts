import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async createProduct(data: {
    product_code: string;
    name: string;
    description?: string;
    preview_image?: string;
    price: number;
    stock_count: number;
    is_enabled?: boolean;
  }) {
    return this.prisma.product.create({
      data: {
        product_code: data.product_code,
        name: data.name,
        description: data.description,
        preview_image: data.preview_image,
        price: data.price,
        stock_count: data.stock_count,
        is_enabled: data.is_enabled ?? true,
      },
    });
  }

  async getProducts(isEnabled?: boolean) {
    return this.prisma.product.findMany({
      where: isEnabled !== undefined ? { is_enabled: isEnabled } : {},
      orderBy: { name: 'asc' },
    });
  }

  async getProduct(productCode: string) {
    const product = await this.prisma.product.findUnique({
      where: { product_code: productCode },
    });

    if (!product) {
      throw new NotFoundException(`Product with code ${productCode} not found`);
    }

    return product;
  }

  async updateProduct(productCode: string, data: Prisma.ProductUpdateInput) {
    await this.getProduct(productCode);

    return this.prisma.product.update({
      where: { product_code: productCode },
      data,
    });
  }

  async deleteProduct(productCode: string) {
    await this.getProduct(productCode);

    return this.prisma.product.delete({
      where: { product_code: productCode },
    });
  }

  async checkAvailability(productCode: string, quantity: number = 1): Promise<boolean> {
    const product = await this.getProduct(productCode);
    return product.is_enabled && product.stock_count >= quantity;
  }

  async updateStock(productCode: string, quantity: number) {
    const product = await this.getProduct(productCode);
    const newStockCount = product.stock_count + quantity;

    if (newStockCount < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    return this.prisma.product.update({
      where: { product_code: productCode },
      data: { stock_count: newStockCount },
    });
  }
}

