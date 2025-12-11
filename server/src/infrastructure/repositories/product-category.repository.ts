import { PrismaClient } from "@prisma/client";
import { CreateProductCategoryDTO, UpdateProductCategoryDTO, ProductCategory } from "../../domain/product-category";

export class ProductCategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateProductCategoryDTO): Promise<ProductCategory> {
    return await this.prisma.productCategory.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async update(data: UpdateProductCategoryDTO): Promise<ProductCategory> {
    return await this.prisma.productCategory.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.productCategory.delete({
      where: { id },
    });
  }

  async getById(id: number): Promise<ProductCategory | null> {
    return await this.prisma.productCategory.findUnique({
      where: { id },
    });
  }
}
