import z from "zod";
import { SlotRepository } from "../../infrastructure/repositories/slot.repository";
import { logger } from "../../domain/services/logger.service";

const inputSchema = z.object({
	id: z.coerce.number(),
	authId: z.number(),
	name: z.string().min(1).optional(),
});

const outputSchema = z.object({
	slotId: z.number(),
});

export class UpdateSlotUsecase {
	constructor(private readonly slotRepo: SlotRepository) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Updating slot",
			employeeId: parsedInput.authId,
			slotId: parsedInput.id,
		});
		log.info("Task started");

		const slots = await this.slotRepo.getByIds([parsedInput.id]);
		if (slots.length === 0) {
			throw Error(`Slot with id ${parsedInput.id} not found`);
		}
		const slot = slots[0];

		slot.update(parsedInput);
		const savedSlot = await this.slotRepo.update(slot);

		log.info("Task completed");
		return outputSchema.parse({ slotId: savedSlot.id });
	}
}