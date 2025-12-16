import z from "zod";
import { ProductRepositoryPrisma } from "../../infrastructure/repositories/product.repository.prisma";
import { logger } from "../../domain/services/logger.service";

const inputSchema = z.object({
  id: z.coerce.number(),
  authId: z.number(),
});

export class DeleteProductUsecase {
  constructor(private readonly productRepo: ProductRepositoryPrisma) {}

  async execute(input: any) {
    const parsedInput = inputSchema.parse(input);
    const log = logger.child({
      task: "Deleting product",
      // employeeId: parsedInput.authId,
      productId: parsedInput.id,
    });
    log.info("Task started");

    const products = await this.productRepo.getByIds([parsedInput.id]);
    if (products.length === 0) {
      throw Error(`Product with id ${parsedInput.id} not found`);
    }

    await this.productRepo.delete(parsedInput.id);

    log.info("Task completed");
    return { success: true };
  }
}
