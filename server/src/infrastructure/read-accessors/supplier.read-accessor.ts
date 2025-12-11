import { PrismaClient } from "@prisma/client";

export class SupplierReadAccessor {
  constructor(private readonly prisma: PrismaClient) {}

  async getSuppliers() {
    return await this.prisma.supplier.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        phoneNumber: true,
        _count: {
          select: {
            products: true
          }
        }
      },
    });
  }

  async getSupplierById(id: number) {
    return await this.prisma.supplier.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true,
        phoneNumber: true,
        products: {
          select: {
            id: true,
            name: true,
            price: true,
          }
        }
      },
    });
  }

  async existById(id: number): Promise<boolean> {
    const count = await this.prisma.supplier.count({
      where: { id },
    });
    return count > 0;
  }
}
