import z from "zod";
import { GoodReceipt } from "../../../domain/entities/good-receipt";
import { Product } from "../../../domain/entities/product"; // ✅ Import Product type
import { logger } from "../../../domain/services/logger.service";
import { ProductRepository } from "../../repositories/product.repository";
import { TransactionManager } from "../../transactions/base.transaction";
import { GoodReceiptRepository } from "../../repositories/good-receipt.repository";
import { EmployeeReadAccessor } from "../read-accessors/employee.read-accessor";

const inputSchema = z.object({
	authId: z.number().positive(),
	items: z.array(
		z.object({
			productId: z.number().positive(),
			quantity: z.number().positive(),
			price: z.number().positive(),
		})
	).min(1),
});

const outputSchema = z.object({
	goodReceiptId: z.number(),
	employeeName: z.string(),
	createdAt: z.date(),
	products: z.array(
		z.object({
			productId: z.number(),
			name: z.string(),
			amount: z.number(),
		})
	),
});

type CreateGoodReceiptOutput = z.infer<typeof outputSchema>;

export class CreateGoodReceiptUsecase {
	constructor(
		private readonly employeeRead: EmployeeReadAccessor,
		private readonly productRepo: ProductRepository,
		private readonly goodReceiptRepo: GoodReceiptRepository,
		private readonly transactionManager: TransactionManager
	) {}

	async execute(input: any): Promise<CreateGoodReceiptOutput> {
		console.log('\n========== CREATE GOOD RECEIPT USECASE ==========');
		console.log('📥 Input received:', JSON.stringify(input, null, 2));
		
		// Validate input schema
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
			task: "Creating good receipt",
			employeeId: parsedInput.authId,
		});
		log.info("Task started");

		// ✅ STEP 1: Extract unique product IDs - EXPLICIT TYPE
		const requestedProductIds: number[] = Array.from(
			new Set(parsedInput.items.map(i => Number(i.productId)))
		);
		console.log('\n📦 STEP 1: Extract product IDs');
		console.log('Requested IDs:', requestedProductIds);

		// ✅ STEP 2: Fetch products from database
		console.log('\n📦 STEP 2: Fetch products from DB');
		let products: Product[]; // ✅ Type annotation
		try {
			products = await this.productRepo.getByIds(requestedProductIds);
			console.log('✅ Products fetched:', {
				requested: requestedProductIds.length,
				found: products.length,
				ids: products.map(p => p.id),
			});
		} catch (error: any) {
			console.error('❌ Failed to fetch products:', error.message);
			throw new Error(`Failed to fetch products: ${error.message}`);
		}
		
		// ✅ STEP 3: Validate all products exist
		console.log('\n📦 STEP 3: Validate products exist');
		if (products.length !== requestedProductIds.length) {
			const foundIds = new Set(products.map(p => p.id));
			const missingIds = requestedProductIds.filter(id => !foundIds.has(id));
			
			console.error('❌ Missing products:', {
				requested: requestedProductIds,
				found: Array.from(foundIds),
				missing: missingIds,
			});
			
			log.warn("Task failed: invalid product ids", { missingIds });
			throw new Error(
				`Không tìm thấy sản phẩm với ID: ${missingIds.join(', ')}. ` +
				`Vui lòng liên hệ quản lý để thêm sản phẩm vào hệ thống trước.`
			);
		}
		
		console.log('✅ All products validated');
		log.debug("Task validated - all products found");

		// ✅ STEP 4: Get employee
		console.log('\n📦 STEP 4: Get employee info');
		const employee = await this.employeeRead.getNameById(parsedInput.authId);
		console.log('✅ Employee found:', { id: employee.id, name: employee.name });
		
		log.debug("Task loaded", {
			employeeId: employee.id,
			employeeName: employee.name,
		});

		// ✅ STEP 5: Update product stock
		console.log('\n📦 STEP 5: Update product stock');
		const productMap = new Map<number, Product>(products.map(p => [p.id, p])); // ✅ Type annotation
		console.log('Product map keys:', Array.from(productMap.keys()));
		
		for (const item of parsedInput.items) {
			const product = productMap.get(item.productId);
			
			if (!product) {
				console.error('❌ CRITICAL: Product not in map:', {
					searchingFor: item.productId,
					mapKeys: Array.from(productMap.keys()),
				});
				throw new Error(`INTERNAL ERROR: Product ${item.productId} not found in map`);
			}
			
			console.log(`  📦 Product ${item.productId}: ${product.amount} + ${item.quantity} = ${product.amount + item.quantity}`);
			product.receiveStock(item.quantity);
		}

		// ✅ STEP 6: Create good receipt entity
		console.log('\n📦 STEP 6: Create good receipt entity');
		const goodReceipt = GoodReceipt.create(
			parsedInput.authId,
			parsedInput.items
		);
		console.log('✅ Good receipt entity created');

		// ✅ STEP 7: Save in transaction
		console.log('\n📦 STEP 7: Save to database (transaction)');
		let save;
		try {
			save = await this.transactionManager.transaction(async (tx) => {
				const [savedGoodReceipt, savedProducts] = await Promise.all([
					this.goodReceiptRepo.add(goodReceipt, tx),
					this.productRepo.saveMany(products, tx),
				]);
				return { goodReceipt: savedGoodReceipt, products: savedProducts };
			});
			
			console.log('✅ Transaction completed:', {
				goodReceiptId: save.goodReceipt.id,
				productsUpdated: save.products.length,
			});
		} catch (error: any) {
			console.error('❌ Transaction failed:', error.message);
			throw new Error(`Failed to save good receipt: ${error.message}`);
		}
		
		log.debug("Task saved", {
			goodReceiptId: save.goodReceipt.id,
			productIds: save.products.map((p: any) => p.id),
		});

		log.info("Task completed");
		console.log('========== USECASE COMPLETED ==========\n');
		
		return outputSchema.parse({
			goodReceiptId: save.goodReceipt.id,
			employeeName: employee.name,
			createdAt: save.goodReceipt.createdAt,
			products: save.products.map((p: any) => ({
				productId: p.id,
				name: p.name,
				amount: p.amount,
			})),
		});
	}
}