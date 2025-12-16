import { ProductCategoryRepository } from "../../infrastructure/repositories/product-category.repository";

export class DeleteProductCategoryUsecase {
  constructor(private readonly categoryRepo: ProductCategoryRepository) {}

  async execute(input: { id: number }) {
    await this.categoryRepo.delete(input.id);
    return { success: true };
  }
}
