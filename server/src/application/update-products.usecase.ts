import { Product } from "../domain/product";
import { ProductRepository } from "../infrastructure/repositories/product.repository";
import { TransactionManager } from "../infrastructure/transaction";

export interface UpdateProdutsUsecaseInput {
	products: {
		id: number;
		name: string;
		price: number;
		unit: string;
		barcode: number;
	}[];
}

export interface UpdateProdutsUsecaseOutput {
	message: string;
}

export class UpdateProdutsUsecase {
	constructor(
		private readonly productRepo: ProductRepository,
		private readonly transactionManager: TransactionManager
	) {}

	async execute(
		input: UpdateProdutsUsecaseInput
	): Promise<UpdateProdutsUsecaseOutput> {
		if (input.products.length < 1)
			throw Error(`Expect at least one product to be affected`);

		const products = await this.productRepo.getByIds(
			input.products.filter((p) => p.id).map((p) => p.id)
		);

		const productMap = new Map(products.map((p) => [p.id, p]));
		const updateProducts: Product[] = [];
		const insertProducts: Product[] = [];
		for (const changed of input.products) {
			const product = productMap.get(changed.id);
			if (product) {
				product.updateName(changed.name);
				product.updatePrice(changed.price);
				product.updateUnit(changed.unit);
				product.updateBarcode(changed.barcode);
				updateProducts.push(product);
			} else {
				const created = Product.create(changed);
				insertProducts.push(created);
			}
		}

		const save = await this.transactionManager.transaction(async (tx) => {
			const promiseQueue = [];
			if (insertProducts.length > 0)
				promiseQueue.push(this.productRepo.add(tx, insertProducts));
			if (updateProducts.length > 0)
				promiseQueue.push(this.productRepo.save(tx, updateProducts));
			return await Promise.all(promiseQueue);
		});

		return { message: "Success" };
	}
}
