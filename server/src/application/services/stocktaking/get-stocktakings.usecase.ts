import { StocktakingRepository } from "../../repositories/stocktaking.repository";
import z from "zod";
import { logger } from "../../../domain/services/logger.service";

const inputSchema = z.object({
	page: z.union([z.number(), z.string()]).optional().transform(val => {
		if (typeof val === 'string') return parseInt(val) || 1;
		return val || 1;
	}),
	pageSize: z.union([z.number(), z.string()]).optional().transform(val => {
		if (typeof val === 'string') return parseInt(val) || 20;
		return val || 20;
	}),
	employeeId: z.union([z.number(), z.string()]).optional().transform(val => {
		if (typeof val === 'string') return parseInt(val) || undefined;
		return val;
	}),
});

const outputSchema = z.object({
	data: z.array(z.any()),
	pagination: z.object({
		page: z.number(),
		pageSize: z.number(),
		total: z.number(),
		totalPages: z.number(),
	}),
});

export class GetStocktakingsUsecase {
	constructor(private readonly stocktakingRepository: StocktakingRepository) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Getting stocktakings",
			input: parsedInput,
		});
		log.info("Task started");

		const { page, pageSize, employeeId } = parsedInput;
		
		try {
			const repo = this.stocktakingRepository as any;
			const allStocktakings = await repo.findAll();
			
			// Filter by employeeId if provided
			let filteredStocktakings = allStocktakings;
			if (employeeId) {
				filteredStocktakings = allStocktakings.filter((s: any) => s.employeeId === employeeId);
			}
			
			// Sort by creation date (newest first)
			filteredStocktakings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
			
			// Apply pagination
			const total = filteredStocktakings.length;
			const startIndex = (page - 1) * pageSize;
			const paginatedStocktakings = filteredStocktakings.slice(startIndex, startIndex + pageSize);

			const result = {
				data: paginatedStocktakings,
				pagination: {
					page,
					pageSize,
					total,
					totalPages: Math.ceil(total / pageSize),
				},
			};

			log.info("Task completed", { totalResults: total });
			return outputSchema.parse(result);
		} catch (error) {
			log.error("Failed to get stocktakings", error);
			throw error;
		}
	}
}
