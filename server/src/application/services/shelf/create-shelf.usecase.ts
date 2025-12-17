import z from "zod";
import { Shelf } from "../../../domain/entities/shelf";
import { ShelfRepository } from "../../../infrastructure/repositories/shelf.repository";
import { logger } from "../../../domain/services/logger.service";

const inputSchema = z.object({
	authId: z.number(),
	name: z.string().min(1),
});

const outputSchema = z.object({
	shelfId: z.number(),
});

export class CreateShelfUsecase {
	constructor(private readonly shelfRepo: ShelfRepository) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Creating shelf",
			employeeId: parsedInput.authId,
		});
		log.info("Task started");

		const shelf = Shelf.create(parsedInput);
		const savedShelf = await this.shelfRepo.add(shelf);

		log.info("Task completed");
		return outputSchema.parse({ shelfId: savedShelf.id });
	}
}