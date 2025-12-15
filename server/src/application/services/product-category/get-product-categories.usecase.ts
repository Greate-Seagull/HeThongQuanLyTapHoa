import { ProductCategoryReadAccessor } from "../../../infrastructure/read-accessors/prisma/product-category.read-accessor";

export class GetProductCategoriesUsecase {
	constructor(
		private readonly categoryReadAccess: ProductCategoryReadAccessor
	) {}

	async execute() {
		return { categories: await this.categoryReadAccess.getCategories() };
	}
}
