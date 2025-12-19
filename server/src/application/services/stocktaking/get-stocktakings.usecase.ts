import z from "zod";
import { logger } from "../../../domain/services/logger.service";
import { StocktakingReadAccessor } from "../../read-accessors/stocktaking.read-accessor";

const inputSchema = z.object({
	page: z.number().optional().default(1),
	pageSize: z.number().optional().default(100),
});

const outputSchema = z.object({
	data: z.array(z.any()),
	total: z.number(),
	page: z.number(),
	pageSize: z.number(),
});

export class GetStocktakingsUsecase {
	constructor(private readonly stocktakingReadAccessor: StocktakingReadAccessor) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Getting stocktakings",
		});
		log.info("Task started");

		const result = await this.stocktakingReadAccessor.getAll(
			parsedInput.page,
			parsedInput.pageSize
		);

		log.info("Task completed", { count: result.data.length });

		return outputSchema.parse(result);
	}
}
