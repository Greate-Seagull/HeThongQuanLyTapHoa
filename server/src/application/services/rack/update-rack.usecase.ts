import z from "zod";
import { RackRepository } from "../../../infrastructure/repositories/rack.repository";
import { logger } from "../../../domain/services/logger.service";

const inputSchema = z.object({
	id: z.coerce.number(),
	authId: z.number(),
	name: z.string().min(1).optional(),
});

const outputSchema = z.object({
	rackId: z.number(),
});

export class UpdateRackUsecase {
	constructor(private readonly rackRepo: RackRepository) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Updating rack",
			employeeId: parsedInput.authId,
			rackId: parsedInput.id,
		});
		log.info("Task started");

		const racks = await this.rackRepo.getByIds([parsedInput.id]);
		if (racks.length === 0) {
			throw Error(`Rack with id ${parsedInput.id} not found`);
		}
		const rack = racks[0];

		rack.update(parsedInput);
		const savedRack = await this.rackRepo.update(rack);

		log.info("Task completed");
		return outputSchema.parse({ rackId: savedRack.id });
	}
}