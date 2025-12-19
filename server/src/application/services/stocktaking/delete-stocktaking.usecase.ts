import z from "zod";
import { logger } from "../../../domain/services/logger.service";
import { StocktakingRepository } from "../../repositories/stocktaking.repository";

const inputSchema = z.object({
	id: z.number(),
});

const outputSchema = z.object({});

export class DeleteStocktakingUsecase {
	constructor(private readonly stocktakingRepo: StocktakingRepository) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Deleting stock-taking",
			stocktakingId: parsedInput.id,
		});
		log.info("Task started");

		// Verify exists
		const existing = await this.stocktakingRepo.getById(parsedInput.id);
		if (!existing) {
			log.warn("Task failed: stocktaking not found");
			throw Error(`Stocktaking with id ${parsedInput.id} not found`);
		}

		// Delete
		await this.stocktakingRepo.delete(parsedInput.id);

		log.info("Task completed");
		return outputSchema.parse({});
	}
}
