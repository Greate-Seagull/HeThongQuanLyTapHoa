import z from "zod";
import { ShelfRepository } from "../../../infrastructure/repositories/shelf.repository";
import { logger } from "../../../domain/services/logger.service";

const inputSchema = z.object({
	id: z.coerce.number(),
	authId: z.number(),
});

export class DeleteShelfUsecase {
	constructor(private readonly shelfRepo: ShelfRepository) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Deleting shelf",
			employeeId: parsedInput.authId,
			shelfId: parsedInput.id,
		});
		log.info("Task started");

		const shelves = await this.shelfRepo.getByIds([parsedInput.id]);
		if (shelves.length === 0) {
			throw Error(`Shelf with id ${parsedInput.id} not found`);
		}

		await this.shelfRepo.delete(parsedInput.id);

		log.info("Task completed");
		return { success: true };
	}
}