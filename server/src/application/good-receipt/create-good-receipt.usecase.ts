import z from "zod";
import { GoodReceipt } from "../../domain/good-receipt";
import { GoodReceiptRepository } from "../../infrastructure/repositories/good-receipt.repository";
import { ProductRepository } from "../../infrastructure/repositories/product.repository";
import { TransactionManager } from "../../infrastructure/transaction";
import { logger } from "../../domain/services/logger.service";
import { EmployeeReadAccess } from "../../infrastructure/read-accessors/employee.read-accessor";
import { create } from "../../domain/services/factory.service";

const inputSchema = z.object({
	authId: z.number(),
	items: z.array(
		z.object({
			productId: z.number(),
			quantity: z.number(),
			price: z.number(),
		})
	),
});

const outputSchema = z.object({
	goodReceiptId: z.number(),
	employeeName: z.string(),
	createdAt: z.date(),
	products: z.array(
		z.object({
			productId: z.number(),
			name: z.string(),
			amount: z.number(),
		})
	),
});

type CreateGoodReceiptOutput = z.infer<typeof outputSchema>;

export class CreateGoodReceiptUsecase {
	constructor(
		private readonly employeeRead: EmployeeReadAccess,
		private readonly productRepo: ProductRepository,
		private readonly goodReceiptRepo: GoodReceiptRepository,
		private readonly transactionManager: TransactionManager
	) {}

	async execute(input: any): Promise<CreateGoodReceiptOutput> {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Creating good receipt",
			employeeId: parsedInput.authId,
		});
		log.info("Task started");

		const products = await this.productRepo.getByIds(
			parsedInput.items.map((i) => i.productId)
		);
		if (products.length != input.items.length) {
			log.warn("Task failed: invalid product id");
			throw Error(`Expect all products to be valid`);
		}
		log.debug("Task validated");

		const employee = await this.employeeRead.getNameById(
			parsedInput.authId
		);
		log.debug("Task loaded", {
			employeeId: employee.id,
		});

		const productMap = new Map(products.map((p) => [p.id, p]));
		for (const item of input.items) {
			productMap.get(item.productId).receiveStock(item.quantity);
		}

		const goodReceiptInput = {
			employeeId: parsedInput.authId,
			goodReceiptDetails: parsedInput.items,
		};
		const goodReceipt = create(GoodReceipt, goodReceiptInput);

		const save = await this.transactionManager.transaction(async (tx) => {
			const [savedGoodReceipt, savedProducts] = await Promise.all([
				this.goodReceiptRepo.add(tx, goodReceipt),
				this.productRepo.save(tx, products),
			]);
			return { goodReceipt: savedGoodReceipt, products: savedProducts };
		});
		log.debug("Task saved", {
			goodReceiptId: save.goodReceipt.id,
			productIds: save.products.map((p: any) => p.id),
		});

		log.info("Task completed");
		return outputSchema.parse({
			goodReceiptId: save.goodReceipt.id,
			employeeName: employee.name,
			createdAt: save.goodReceipt.createdAt,
			products: save.products.map((p: any) => ({
				productId: p.id,
				name: p.name,
				amount: p.amount,
			})),
		});
	}
}
