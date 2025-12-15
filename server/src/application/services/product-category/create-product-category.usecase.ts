import { ProductCategoryRepository } from "../../../infrastructure/repositories/product-category.repository";
import { CreateProductCategoryDTO } from "../../../domain/product-category";

export class CreateProductCategoryUsecase {
	constructor(private readonly categoryRepo: ProductCategoryRepository) {}

	async execute(input: CreateProductCategoryDTO) {
		const category = await this.categoryRepo.create(input);
		return { category };
	}
}
