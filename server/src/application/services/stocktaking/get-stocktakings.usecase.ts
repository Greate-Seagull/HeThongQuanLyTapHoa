import z from "zod";
import { logger } from "../../../domain/services/logger.service";
import { StocktakingReadAccessor } from "../read-accessors/stocktaking.read-accessor";

const inputSchema = z.object({
	page: z.number().positive().default(1),
	pageSize: z.number().positive().default(100),
});

const outputSchema = z.object({
	data: z.array(z.any()),
	total: z.number(),
	page: z.number(),
	pageSize: z.number(),
});

export class GetStocktakingsUsecase {
	constructor(private readonly stocktakingRead: StocktakingReadAccessor) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({ task: "Get stocktakings" });
		log.info("Task started");

		const result = await this.stocktakingRead.getAll(parsedInput.page, parsedInput.pageSize);
		
		log.info("Task completed", { count: result.data.length });
		
		return outputSchema.parse({
			data: result.data,
			total: result.total,
			page: parsedInput.page,
			pageSize: parsedInput.pageSize,
		});
	}
}
