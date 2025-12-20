import { prisma } from './../../../composition-root';
import z from "zod";
import { Product } from "../../../domain/entities/product";
import { ProductRepositoryPrisma } from "../../../infrastructure/repositories/product.repository.prisma";
import { ProductCategoryReadAccessor } from "../../../infrastructure/read-accessors/prisma/product-category.read-accessor";
import { SupplierReadAccessor } from "../../../infrastructure/read-accessors/prisma/supplier.read-accessor";
import { logger } from "../../../domain/services/logger.service";

const inputSchema = z.object({
	authId: z.number(),
	name: z.string().min(1),
	price: z.number().min(0),
	amount: z.number().int().min(0).optional().default(0),
	unit: z.string().min(1),
	barcode: z.coerce.number().positive(),
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
		console.log('\n========== CREATE PRODUCT USECASE ==========');
		console.log('📥 Input received:', JSON.stringify(input, null, 2));
		
		// Validate input
		let parsedInput;
		try {
			parsedInput = inputSchema.parse(input);
			console.log('✅ Input validation passed');
		} catch (error: any) {
			console.error('❌ Validation failed:', {
				message: error.message,
				issues: error.issues,
			});
			
			if (error.issues && error.issues.length > 0) {
				const firstIssue = error.issues[0];
				throw new Error(`Validation failed at ${firstIssue.path.join('.')}: ${firstIssue.message}`);
			}
			
			throw new Error(`Validation error: ${error.message}`);
		}
		
		const log = logger.child({
			task: "Creating product",
			barcode: parsedInput.barcode,
		});
		log.info("Task started");

		// Validate category
		if (parsedInput.categoryId) {
			const categoryExists = await this.categoryRead.getById(parsedInput.categoryId);
			if (!categoryExists) {
				throw Error(`Category with id ${parsedInput.categoryId} not found`);
			}
		}

		// Validate supplier
		if (parsedInput.supplierId) {
			const supplierExists = await this.supplierRead.getById(parsedInput.supplierId);
			if (!supplierExists) {
				throw Error(`Supplier with id ${parsedInput.supplierId} not found`);
			}
		}

		// Create product entity
		console.log('📦 Creating product entity...');
		const product = Product.create(parsedInput);
		
		// Save to database
		let savedProduct;
		try {
			savedProduct = await this.productRepo.create(product);
			console.log('✅ Product saved successfully:', {
				id: savedProduct.id,
				barcode: savedProduct.barcode,
			});
		} catch (error: any) {
			console.error('❌ Failed to save product:', error.message);
			
			// Better error messages
			if (error.message.includes('barcode') && error.message.includes('already exists')) {
				throw new Error(`Mã vạch ${parsedInput.barcode} đã tồn tại trong hệ thống. Vui lòng sử dụng mã vạch khác.`);
			}
			
			throw error;
		}
		
		log.info("Task completed", { productId: savedProduct.id });
		console.log('========== USECASE COMPLETED ==========\n');
		
		return outputSchema.parse({ productId: savedProduct.id });
	}
}