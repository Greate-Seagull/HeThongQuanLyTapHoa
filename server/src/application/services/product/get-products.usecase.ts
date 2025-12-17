import z from "zod";
import { logger } from "../../../domain/services/logger.service";
import { ProductReadAccessor } from "../read-accessors/product.read-accessor";

const inputSchema = z.object({
	page: z.number().default(1),
	limit: z.number().default(10),
});

const outputSchema = z.object({
	products: z.array(
		z.object({
			id: z.number(),
			name: z.string(),
			price: z.number(),
			unit: z.string(),
			barcode: z.number(),
		})
	),
});

export class GetProductsUsecase {
	constructor(private readonly productReadAccess: ProductReadAccessor) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Getting products",
		});
		log.info("Task started");

		const products = await this.productReadAccess.getProducts(
			parsedInput.page,
			parsedInput.limit
		);

		log.info("Task completed");
		return outputSchema.parse({
			products,
		});
	}
}
