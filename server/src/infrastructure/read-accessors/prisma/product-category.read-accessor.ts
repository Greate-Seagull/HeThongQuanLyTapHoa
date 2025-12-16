import { PrismaClient } from "@prisma/client";

export class ProductCategoryReadAccessor {
  constructor(private readonly prisma: PrismaClient) {}

  async getCategories() {
    return await this.prisma.productCategory.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            products: true
          }
        }
      },
    });
  }

  async getCategoryById(id: number) {
    return await this.prisma.productCategory.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
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
    const count = await this.prisma.productCategory.count({
      where: { id },
    });
    return count > 0;
  }
}
