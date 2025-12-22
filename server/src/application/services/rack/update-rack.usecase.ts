import z from "zod";
import { RackRepository } from "../../../infrastructure/repositories/rack.repository";
import { ShelfRepository } from "../../../infrastructure/repositories/shelf.repository";
import { logger } from "../../../domain/services/logger.service";

const inputSchema = z.object({
	id: z.coerce.number(),
	authId: z.number(),
	name: z.string().min(1).optional(),
	shelfId: z.number().optional(),  // ✅ ADD: Allow updating shelfId
});

const outputSchema = z.object({
	rackId: z.number(),
});

export class UpdateRackUsecase {
	constructor(
		private readonly rackRepo: RackRepository,
		private readonly shelfRepo: ShelfRepository  // ✅ ADD: Need to verify shelf exists
	) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Updating rack",
			employeeId: parsedInput.authId,
			rackId: parsedInput.id,
		});
		log.info("Task started");

		// Verify rack exists
		const racks = await this.rackRepo.getByIds([parsedInput.id]);
		if (racks.length === 0) {
			throw Error(`Rack with id ${parsedInput.id} not found`);
		}
		const rack = racks[0];

		// ✅ If shelfId is changing, verify new shelf exists
		if (parsedInput.shelfId && parsedInput.shelfId !== rack.shelfId) {
			const newShelves = await this.shelfRepo.getByIds([parsedInput.shelfId]);
			if (newShelves.length === 0) {
				throw Error(`Shelf with id ${parsedInput.shelfId} not found`);
			}
			console.log(`✅ Moving rack ${rack.id} from shelf ${rack.shelfId} to shelf ${parsedInput.shelfId}`);
		}

		rack.update(parsedInput);
		const savedRack = await this.rackRepo.update(rack);

		log.info("Task completed");
		return outputSchema.parse({ rackId: savedRack.id });
	}
}