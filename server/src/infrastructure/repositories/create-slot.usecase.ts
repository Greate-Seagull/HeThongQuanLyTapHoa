import z from "zod";
import { Slot } from "../../domain/entities/slot";
import { SlotRepository } from "../../infrastructure/repositories/slot.repository";
import { RackRepository } from "../../infrastructure/repositories/rack.repository";
import { logger } from "../../domain/services/logger.service";

const inputSchema = z.object({
	authId: z.number(),
	name: z.string().min(1),
	rackId: z.number(),
});

const outputSchema = z.object({
	slotId: z.number(),
});

export class CreateSlotUsecase {
	constructor(
		private readonly slotRepo: SlotRepository,
		private readonly rackRepo: RackRepository
	) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Creating slot",
			employeeId: parsedInput.authId,
		});
		log.info("Task started");

		// Validate Rack exists
		const racks = await this.rackRepo.getByIds([parsedInput.rackId]);
		if (racks.length === 0) {
			throw Error(`Rack with id ${parsedInput.rackId} not found`);
		}

		const slot = Slot.create(parsedInput);
		const savedSlot = await this.slotRepo.add(slot);

		log.info("Task completed");
		return outputSchema.parse({ slotId: savedSlot.id });
	}
}