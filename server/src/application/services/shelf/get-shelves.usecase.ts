import { ShelfReadAccessor } from "../read-accessors/shelf.read-accessor";
import z from "zod";
import { logger } from "../../../domain/services/logger.service";

const inputSchema = z.object({}).optional();

const outputSchema = z.array(z.any());

export class GetShelvesUsecase {
	constructor(private readonly shelfReadAccessor: ShelfReadAccessor) {}

	async execute(input?: any) {
		const log = logger.child({
			task: "Getting shelves with racks and slots",
		});
		log.info("Task started");

		try {
			const shelves = await this.shelfReadAccessor.getShelvesWithRacksAndSlots();
			
			log.info("Task completed", { totalShelves: shelves.length });
			return outputSchema.parse(shelves);
		} catch (error) {
			log.error("Failed to get shelves", error);
			throw error;
		}
	}
}
