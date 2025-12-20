import { prisma } from './../../../composition-root';
import { ProductPrismaReadAccessor } from "../../../infrastructure/read-accessors/prisma/product.read-accessor";

export class GetProductsUsecase {
  constructor(private readonly productReadAccess: ProductPrismaReadAccessor) {}

  async execute(input: any) {
    return { products: await this.productReadAccess.getProducts() };
  }
}
