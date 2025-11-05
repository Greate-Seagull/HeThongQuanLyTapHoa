import { Product } from "src/domain/product";
import { ProductReadAccessor } from "src/infrastructure/read_accessors/product.read-accessor";

export class SearchProductsUsecaseInput {
	constructor(public productId: number) {}
}

export class SearchProductsUsecaseOutput {
	constructor(
		public id: Number,
		public name: String,
		public price: Number,
		public unit: String
	) {}
}

export class SearchProductsUsecase {
	constructor(private readonly productRepository: ProductReadAccessor) {}

	async execute(
		input: SearchProductsUsecaseInput
	): Promise<SearchProductsUsecaseOutput> {
		const output = await this.productRepository.getProductDetailById(
			input.productId
		);
		if (!output) throw Error(`Product not found. ${input.productId}`);

		return new SearchProductsUsecaseOutput(
			output.id,
			output.name,
			output.price,
			output.unit
		);
	}
}
