import { ShelfReadAccessor } from "../../infrastructure/read-accessors/shelf.read-accessor";
import { logger } from "../../domain/services/logger.service";

export class GetShelvesUsecase {
	constructor(private readonly shelfRead: ShelfReadAccessor) {}

	async execute() {
		const log = logger.child({ task: "Get all shelves" });
		log.info("Task started");
		const shelves = await this.shelfRead.getAll();
		log.info("Task completed");
		return shelves;
	}
}