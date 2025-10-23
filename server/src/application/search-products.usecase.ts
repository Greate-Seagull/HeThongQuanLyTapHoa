import { Product } from "src/domain/product";
import { ProductRepository } from "src/infrastructure/repositories/product.repository";

export class SearchProductsUsecaseInput {
	id: number = 0;
}

export class SearchProductsUsecaseOutput {
	post: Product;

	constructor(post: Product) {
		this.post = post;
	}
}

export class SearchProductsUsecase {
	private productRepository: ProductRepository;

	constructor(productRepository: ProductRepository) {
		this.productRepository = productRepository;
	}

	async execute(
		input: SearchProductsUsecaseInput
	): Promise<SearchProductsUsecaseOutput> {
		console.log("Enter search products use case");
		const result = await this.productRepository.getById(null, input.id);
		return new SearchProductsUsecaseOutput(result);
	}
}
