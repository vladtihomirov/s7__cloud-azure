import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: { name: string; email: string; address?: string }) {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        address: data.address,
        balance: 0,
      },
    });
  }

  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  async updateUser(userId: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { user_id: userId },
      data,
    });
  }

  async getUserBalance(userId: string) {
    const user = await this.getUser(userId);
    return { balance: user.balance };
  }

  async updateBalance(userId: string, amount: number) {
    const user = await this.getUser(userId);
    const newBalance = Number(user.balance) + amount;

    return this.prisma.user.update({
      where: { user_id: userId },
      data: { balance: newBalance },
    });
  }
}

