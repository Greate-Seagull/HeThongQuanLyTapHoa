import z from "zod";
import { ShelfRepository } from "../../../infrastructure/repositories/shelf.repository";
import { logger } from "../../../domain/services/logger.service";

const inputSchema = z.object({
	id: z.coerce.number(),
	authId: z.number(),
	name: z.string().min(1).optional(),
});

const outputSchema = z.object({
	shelfId: z.number(),
});

export class UpdateShelfUsecase {
	constructor(private readonly shelfRepo: ShelfRepository) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Updating shelf",
			employeeId: parsedInput.authId,
			shelfId: parsedInput.id,
		});
		log.info("Task started");

		const shelves = await this.shelfRepo.getByIds([parsedInput.id]);
		if (shelves.length === 0) {
			throw Error(`Shelf with id ${parsedInput.id} not found`);
		}
		const shelf = shelves[0];

		shelf.update(parsedInput);
		const savedShelf = await this.shelfRepo.update(shelf);

		log.debug("Task updated", { shelfId: savedShelf.id });
		log.info("Task completed");

		return outputSchema.parse({ shelfId: savedShelf.id });
	}
}