import z from "zod";
import { ProductRepositoryPrisma } from "../../../infrastructure/repositories/product.repository.prisma";
import { logger } from "../../../domain/services/logger.service";

const inputSchema = z.object({
	productId: z.coerce.number(),
	authId: z.number(),
	newAmount: z.number().int().min(0),
	reason: z.string().optional(),
});

const outputSchema = z.object({
	productId: z.number(),
	oldAmount: z.number(),
	newAmount: z.number(),
});

export class AdjustProductInventoryUsecase {
	constructor(private readonly productRepo: ProductRepositoryPrisma) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Adjusting product inventory",
			employeeId: parsedInput.authId,
			productId: parsedInput.productId,
		});
		log.info("Task started", {
			newAmount: parsedInput.newAmount,
			reason: parsedInput.reason,
		});

		const products = await this.productRepo.getByIds([parsedInput.productId]);
		if (products.length === 0) {
			throw Error(`Product with id ${parsedInput.productId} not found`);
		}
		const product = products[0];
		const oldAmount = product.amount;

		// Cập nhật số lượng
		product.update({ amount: parsedInput.newAmount });
		const savedProduct = await this.productRepo.update(product);

		log.info("Task completed", {
			oldAmount,
			newAmount: savedProduct.amount,
		});

		return outputSchema.parse({
			productId: savedProduct.id,
			oldAmount,
			newAmount: savedProduct.amount,
		});
	}
}
