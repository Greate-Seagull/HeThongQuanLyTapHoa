import z from "zod";
import { ProductRepositoryPrisma } from "../../infrastructure/repositories/product.repository.prisma";
import { ProductCategoryReadAccessor } from "../../infrastructure/read-accessors/product-category.read-accessor";
import { SupplierReadAccessor } from "../../infrastructure/read-accessors/supplier.read-accessor";
import { logger } from "../../domain/services/logger.service";

const inputSchema = z.object({
	id: z.coerce.number(),
	authId: z.number(),
	name: z.string().optional(),
	price: z.number().min(0).optional(),
	amount: z.number().int().min(0).optional(),
	unit: z.string().optional(),
	barcode: z.coerce.number().optional().nullable(),
	categoryId: z.number().optional().nullable(),
	supplierId: z.number().optional().nullable(),
});

const outputSchema = z.object({
	productId: z.number(),
});

export class UpdateProductUsecase {
	constructor(
		private readonly productRepo: ProductRepositoryPrisma,
		private readonly categoryRead: ProductCategoryReadAccessor,
		private readonly supplierRead: SupplierReadAccessor
	) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Updating product",
			// employeeId: parsedInput.authId,
			productId: parsedInput.id,
		});
		log.info("Task started");

		const products = await this.productRepo.getByIds([parsedInput.id]);
		if (products.length === 0) {
			throw Error(`Product with id ${parsedInput.id} not found`);
		}
		const product = products[0];

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

		product.update(parsedInput);
		const savedProduct = await this.productRepo.update(product);

		log.info("Task completed");
		return outputSchema.parse({ productId: savedProduct.id });
	}
}