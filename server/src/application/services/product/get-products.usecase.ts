import z from "zod";
import { logger } from "../../../domain/services/logger.service";
import { ProductReadAccessor } from "../read-accessors/product.read-accessor";

const inputSchema = z.object({
	page: z.number().optional().default(1),
	limit: z.number().optional().default(1000), // Increase default limit
});

const outputSchema = z.object({
	products: z.array(
		z.object({
			id: z.number(),
			name: z.string().nullable(),
			price: z.number(),
			unit: z.string(),
			barcode: z.number(),
			amount: z.number().optional().default(0),
			status: z.string().optional().default('GOOD'),
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

		log.info("Task completed", { count: products.length });
		
		// Ensure products array is returned with all fields
		const productsWithDefaults = (products || []).map(p => ({
			id: p.id,
			name: p.name,
			price: p.price,
			unit: p.unit,
			barcode: p.barcode,
			amount: (p as any).amount ?? 0,
			status: (p as any).status ?? 'GOOD',
		}));

		return outputSchema.parse({
			products: productsWithDefaults,
		});
	}
}
