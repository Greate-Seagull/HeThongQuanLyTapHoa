import z from "zod";
import { RackRepository } from "../../../infrastructure/repositories/rack.repository";
import { logger } from "../../../domain/services/logger.service";

const inputSchema = z.object({
	id: z.coerce.number(),
	authId: z.number(),
});

export class DeleteRackUsecase {
	constructor(private readonly rackRepo: RackRepository) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Deleting rack",
			employeeId: parsedInput.authId,
			rackId: parsedInput.id,
		});
		log.info("Task started");

		const racks = await this.rackRepo.getByIds([parsedInput.id]);
		if (racks.length === 0) {
			throw Error(`Rack with id ${parsedInput.id} not found`);
		}

		await this.rackRepo.delete(parsedInput.id);
		log.info("Task completed");
		return { success: true };
	}
}