import { Invoice } from "../domain/invoice";
import { Product } from "../domain/product";
import { Promotion } from "../domain/promotion";
import { SalesTransactionService } from "../domain/sales-transaction.service";
import { EmployeeRepository } from "../infrastructure/repositories/employee.repository";
import { InvoiceRepository } from "../infrastructure/repositories/invoice.repository";
import { ProductRepository } from "../infrastructure/repositories/product.repository";
import { PromotionRepository } from "../infrastructure/repositories/promotion.repository";
import { TransactionManager } from "../infrastructure/repositories/transaction";
import { UserRepository } from "../infrastructure/repositories/user.repository";

export type ItemInput = {
	productId: number;
	quantity: number;
	promotionId: number;
};

export class CreateInvoiceUsecaseInput {
	constructor(
		public employeedId: number,
		public userId: number,
		public usedPoint: number = 0,
		public items: ItemInput[]
	) {}
}

export type ProductOutput = {
	productId: number;
	productName: string;
	quantity: number;
	originalPrice: number;
	discountedPrice: number;
	promotionName: string;
	subTotal: number;
};

export type EmployeeOutput = {
	employeeId: number;
	name: string;
};

export type UserOutput = {
	userId: number;
	name: string;
};

export class CreateInvoiceUsecaseOutput {
	constructor(
		public invoiceId: number,
		public employee: EmployeeOutput,
		public user: UserOutput,
		public usedPoint: number,
		public products: ProductOutput[],
		public total: number
	) {}
}

export class CreateInvoiceUsecase {
	constructor(
		private readonly employeeRepo: EmployeeRepository,
		private readonly userRepo: UserRepository,
		private readonly productRepo: ProductRepository,
		private readonly promotionRepo: PromotionRepository,
		private readonly invoiceRepo: InvoiceRepository,
		private readonly salesTransactionService: SalesTransactionService,
		private readonly transactionManager: TransactionManager
	) {}

	async execute(input: any): Promise<CreateInvoiceUsecaseOutput> {
		const employee = await this.employeeRepo.getById(input.employeeId);
		if (!employee) throw Error(`Employee not found, ${input.employeeId}`);

		const user = await this.userRepo.getById(input.userId);

		const products: Product[] = await this.productRepo.getByIds(
			input.items.map((p) => p.productId)
		);
		if (products.length !== input.items.length)
			throw Error(`Expect all products to be valid`);

		const promotionIds = this.getDistinctPromotionIds(input.items);
		const promotions: Promotion[] = await this.promotionRepo.getByIds(
			promotionIds
		);
		if (promotions.length !== promotionIds.length)
			throw Error(`Expect all promotions to be valid`);

		const serviceResult = this.salesTransactionService.processSale({
			user,
			usedPoint: input.usedPoint,
			products,
			promotions,
			items: input.items,
		});

		const invoice = Invoice.create({
			employee,
			user: serviceResult.user,
			usedPoint: serviceResult.usedPoint,
			total: serviceResult.total,
			items: serviceResult.items.map((i) => ({
				productId: i.productId,
				quantity: i.quantity,
				promotionId: i.promotionId,
			})),
		});

		const save = await this.transactionManager.transaction(async (tx) => {
			const [savedUser, savedProducts, savedInvoice] = await Promise.all([
				this.userRepo.save(tx, user),
				this.productRepo.save(tx, products),
				this.invoiceRepo.add(tx, invoice),
			]);

			return {
				user: savedUser,
				products: savedProducts,
				invoice: savedInvoice,
			};
		});

		const employeeOutput: EmployeeOutput = {
			employeeId: employee.id,
			name: employee.name,
		};
		const userOutput: UserOutput = {
			userId: save.user.id,
			name: save.user.name,
		};
		const productsOutput: ProductOutput[] = serviceResult.items;

		return new CreateInvoiceUsecaseOutput(
			save.invoice.id,
			employeeOutput,
			userOutput,
			save.invoice.usedPoint,
			productsOutput,
			save.invoice.total
		);
	}

	private getDistinctPromotionIds(items: ItemInput[]): number[] {
		let promotionIds = new Set<number>();
		for (const item of items) {
			if (item.promotionId != null) promotionIds.add(item.promotionId);
		}
		return [...promotionIds];
	}
}
