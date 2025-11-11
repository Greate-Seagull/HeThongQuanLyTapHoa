import { ProductReadAccessor } from "../infrastructure/read-accessors/product.read-accessor";

export interface GetProductsUsecaseOutput {
	products: any[];
}

export class GetProductsUsecase {
	constructor(private readonly productReadAccess: ProductReadAccessor) {}

	async execute(input: any) {
		return { products: await this.productReadAccess.getProducts() };
	}
}
