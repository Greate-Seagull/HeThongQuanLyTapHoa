import z from "zod";
import { logger } from "../../../domain/services/logger.service";
import { GoodReceiptReadAccessor } from "../read-accessors/good-receipt.read-accessor";

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

export class GetGoodReceiptsUsecase {
	constructor(
		private readonly goodReceiptReadAccessor: GoodReceiptReadAccessor
	) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Getting good receipts",
			page: parsedInput.page,
			pageSize: parsedInput.pageSize,
		});
		log.info("Task started");

		const result = await this.goodReceiptReadAccessor.getAll(
			parsedInput.page,
			parsedInput.pageSize
		);

		log.info("Task completed", { count: result.data.length });
		return outputSchema.parse(result);
	}
}
