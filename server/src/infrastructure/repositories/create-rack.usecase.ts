import z from "zod";
import { Rack } from "../../domain/rack";
import { RackRepository } from "../../infrastructure/repositories/rack.repository";
import { ShelfRepository } from "../../infrastructure/repositories/shelf.repository";
import { logger } from "../../domain/services/logger.service";

const inputSchema = z.object({
	authId: z.number(),
	name: z.string().min(1),
	shelfId: z.number(),
});

const outputSchema = z.object({
	rackId: z.number(),
});

export class CreateRackUsecase {
	constructor(
		private readonly rackRepo: RackRepository,
		private readonly shelfRepo: ShelfRepository
	) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Creating rack",
			employeeId: parsedInput.authId,
		});
		log.info("Task started");

		// Validate Shelf exists
		const shelves = await this.shelfRepo.getByIds([parsedInput.shelfId]);
		if (shelves.length === 0) {
			throw Error(`Shelf with id ${parsedInput.shelfId} not found`);
		}

		const rack = Rack.create(parsedInput);
		const savedRack = await this.rackRepo.add(rack);

		log.info("Task completed");
		return outputSchema.parse({ rackId: savedRack.id });
	}
}