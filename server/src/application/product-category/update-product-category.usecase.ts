import { ProductCategoryRepository } from "../../infrastructure/repositories/product-category.repository";
import { UpdateProductCategoryDTO } from "../../domain/product-category";

export class UpdateProductCategoryUsecase {
  constructor(private readonly categoryRepo: ProductCategoryRepository) {}

  async execute(input: UpdateProductCategoryDTO) {
    const category = await this.categoryRepo.update(input);
    return { category };
  }
}
