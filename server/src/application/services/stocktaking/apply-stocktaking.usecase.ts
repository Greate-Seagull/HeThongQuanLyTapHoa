import { StocktakingRepository } from "../../repositories/stocktaking.repository";
import { ProductRepository } from "../../repositories/product.repository";
import z from "zod";
import { logger } from "../../../domain/services/logger.service";

const inputSchema = z.object({
	id: z.number(),
	authId: z.number(),
});

const outputSchema = z.object();

export class ApplyStocktakingUsecase {
	constructor(
		private stocktakingRepository: StocktakingRepository,
		private productRepository: ProductRepository
	) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Applying stocktaking",
			stocktakingId: parsedInput.id,
			authId: parsedInput.authId,
		});
		log.info("Task started");

		const { id } = parsedInput;

		// Get stocktaking with details
		const stocktaking = await this.stocktakingRepository.getById(id);
		if (!stocktaking) {
			log.warn("Task failed: stocktaking not found");
			throw new Error("Phiếu kiểm kê không tồn tại");
		}

		// Apply quantity adjustments for each product
		for (const detail of stocktaking.stocktakingDetails) {
			const product = await this.productRepository.getById(detail.productId);
			if (!product) continue;

			// Update product amount based on stocktaking count
			// Only update if status is GOOD
			if (detail.status === 'GOOD') {
				 // Set the amount using the entity's property setter
				(product as any)._amount = detail.quantity;
				await this.productRepository.save(product);
			}
			// For EXPIRED products, set amount to 0
			else if (detail.status === 'EXPIRED') {
				(product as any)._amount = 0;
				await this.productRepository.save(product);
			}
		}

		log.info("Task completed");
		return outputSchema.parse({});
	}
}
