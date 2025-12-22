import { PrismaClient } from "../../../generated/client";

export class AccountReadAccessor {
  constructor(private readonly prisma: PrismaClient) {}

  async existsByPhoneNumber(phoneNumber: string): Promise<boolean> {
    const count = await this.prisma.account.count({
      where: { phoneNumber },
    });
    return count > 0;
  }

  async getByPhoneNumber(phoneNumber: string) {
    return await this.prisma.account.findUnique({
      where: { phoneNumber },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            point: true,
          },
        },
      },
    });
  }

  async getByUserId(userId: number) {
    return await this.prisma.account.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            point: true,
          },
        },
      },
    });
  }

  async getAll() {
    return await this.prisma.account.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            point: true,
          },
        },
      },
    });
  }

  async getById(id: number) {
    return await this.prisma.account.findUnique({
      where: { id },
      select: {
        id: true,
        phoneNumber: true,
        user: {
          select: {
            id: true,
            name: true,
            point: true,
          },
        },
      },
    });
  }
}
