import z from "zod";
import { PromotionRepository } from "../../repositories/promotion.repository";
import { logger } from "../../../domain/services/logger.service";

const inputSchema = z.object({
	id: z.coerce.number(),
	authId: z.number(),
});

export class DeletePromotionUsecase {
	constructor(
		private readonly promotionRepo: PromotionRepository
	) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Deleting promotion",
			employeeId: parsedInput.authId,
			promotionId: parsedInput.id,
		});
		log.info("Task started");

		const promotions = await this.promotionRepo.getByIds([parsedInput.id]);
		if (promotions.length === 0) {
			throw Error(`Promotion with id ${parsedInput.id} not found`);
		}

		await this.promotionRepo.delete(parsedInput.id);

		log.info("Task completed");
		return { success: true };
	}
}