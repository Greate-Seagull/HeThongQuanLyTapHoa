import { prisma } from './../../../composition-root';
import { ProductPrismaReadAccessor } from "../../../infrastructure/read-accessors/prisma/product.read-accessor";
import z from "zod";
import { logger } from "../../../domain/services/logger.service";
import { ProductReadAccessor } from "../read-accessors/product.read-accessor";

const inputSchema = z.object({
	page: z.number().optional().default(1),
	limit: z.number().optional().default(1000),
});

const outputSchema = z.object({
	products: z.array(z.any()),
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

		return outputSchema.parse({ products });
	}
}
