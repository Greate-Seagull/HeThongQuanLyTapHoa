import { ProductReadAccessor } from "../infrastructure/read_accessors/product.read-accessor";

export interface GetProductsUsecaseOutput {
	products: any[];
}

export class GetProductsUsecase {
	constructor(private readonly productReadAccess: ProductReadAccessor) {}

	async execute(input: any) {
		return { products: await this.productReadAccess.getProducts() };
	}
}
