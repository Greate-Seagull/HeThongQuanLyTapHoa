import z from "zod";
import { Product } from "../../domain/product";
import { ProductRepositoryPrisma } from "../../infrastructure/repositories/product.repository.prisma";
import { ProductCategoryReadAccessor } from "../../infrastructure/read-accessors/product-category.read-accessor";
import { SupplierReadAccessor } from "../../infrastructure/read-accessors/supplier.read-accessor";
import { logger } from "../../domain/services/logger.service";

const inputSchema = z.object({
	authId: z.number(),
	name: z.string().min(1),
	price: z.number().min(0),
	amount: z.number().int().min(0).optional().default(0),
	unit: z.string().min(1),
	barcode: z.coerce.number().optional().nullable(),
	categoryId: z.number().optional().nullable(),
	supplierId: z.number().optional().nullable(),
});


const outputSchema = z.object({
	productId: z.number(),
});

export class CreateProductUsecase {
	constructor(
		private readonly productRepo: ProductRepositoryPrisma,
		private readonly categoryRead: ProductCategoryReadAccessor,
		private readonly supplierRead: SupplierReadAccessor
	) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Creating product",
			// employeeId: parsedInput.authId,
		});
		log.info("Task started");

		if (parsedInput.categoryId) {
			const categoryExists = await this.categoryRead.getById(parsedInput.categoryId);
			if (!categoryExists) {
				throw Error(`Category with id ${parsedInput.categoryId} not found`);
			}
		}

		if (parsedInput.supplierId) {
			const supplierExists = await this.supplierRead.getById(parsedInput.supplierId);
			if (!supplierExists) {
				throw Error(`Supplier with id ${parsedInput.supplierId} not found`);
			}
		}

		const product = Product.create(parsedInput);
		const savedProduct = await this.productRepo.create(product);
		
		log.info("Task completed");
		return outputSchema.parse({ productId: savedProduct.id });
	}
}