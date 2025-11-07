import { GoodReceipt } from "../domain/good-receipt";
import { EmployeeRepository } from "../infrastructure/repositories/employee.repository";
import { GoodReceiptRepository } from "../infrastructure/repositories/good-receipt.repository";
import { ProductRepository } from "../infrastructure/repositories/product.repository";
import { TransactionManager } from "../infrastructure/repositories/transaction";

type LineItem = {
	productId: number;
	quantity: number;
	price: number;
};

export interface CreateGoodReceiptUsecaseInput {
	employeeId: number;
	items: LineItem[];
}

export interface CreateGoodReceiptUsecaseOutput {
	goodReceiptId: number;
	employeeName: string;
	createdAt: Date;
	products: {
		productId: number;
		name: string;
		amount: number;
	}[];
}

export class CreateGoodReceiptUsecase {
	constructor(
		private readonly employeeRepo: EmployeeRepository,
		private readonly productRepo: ProductRepository,
		private readonly goodReceiptRepo: GoodReceiptRepository,
		private readonly transactionManager: TransactionManager
	) {}

	async execute(
		input: CreateGoodReceiptUsecaseInput
	): Promise<CreateGoodReceiptUsecaseOutput> {
		const employee = await this.employeeRepo.getById(input.employeeId);
		if (!employee) throw Error(`Employee not found, ${input.employeeId}`);

		const products = await this.productRepo.getByIds(
			input.items.map((i) => i.productId)
		);
		if (products.length != input.items.length)
			throw Error(`Expect all products to be valid`);

		const productMap = new Map(products.map((p) => [p.id, p]));
		for (const item of input.items) {
			productMap.get(item.productId).receiveStock(item.quantity);
		}

		const goodReceipt = GoodReceipt.create(employee.id, input.items);

		const save = await this.transactionManager.transaction(async (tx) => {
			const [savedGoodReceipt, savedProducts] = await Promise.all([
				this.goodReceiptRepo.add(tx, goodReceipt),
				this.productRepo.save(tx, products),
			]);

			return { goodReceipt: savedGoodReceipt, products: savedProducts };
		});

		const output: CreateGoodReceiptUsecaseOutput = {
			goodReceiptId: save.goodReceipt.id,
			employeeName: employee.name,
			createdAt: save.goodReceipt.createdAt,
			products: save.products.map((p) => ({
				productId: p.id,
				name: p.name,
				amount: p.amount,
			})),
		};

		return output;
	}
}
