import z from "zod";
import { SlotRepository } from "../../infrastructure/repositories/slot.repository";
import { logger } from "../../domain/services/logger.service";

const inputSchema = z.object({
	id: z.coerce.number(),
	authId: z.number(),
});

export class DeleteSlotUsecase {
	constructor(private readonly slotRepo: SlotRepository) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Deleting slot",
			employeeId: parsedInput.authId,
			slotId: parsedInput.id,
		});
		log.info("Task started");

		const slots = await this.slotRepo.getByIds([parsedInput.id]);
		if (slots.length === 0) {
			throw Error(`Slot with id ${parsedInput.id} not found`);
		}

		await this.slotRepo.delete(parsedInput.id);
		log.info("Task completed");
		return { success: true };
	}
}