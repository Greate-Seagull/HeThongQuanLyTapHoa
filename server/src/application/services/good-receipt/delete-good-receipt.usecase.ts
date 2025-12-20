import z from "zod";
import { logger } from "../../../domain/services/logger.service";
import { GoodReceiptRepository } from "../../repositories/good-receipt.repository";
import { ProductRepository } from "../../repositories/product.repository";
import { TransactionManager } from "../../transactions/base.transaction";
import { EmployeeReadAccessor } from "../read-accessors/employee.read-accessor";

const inputSchema = z.object({
	id: z.number().positive(),
	authId: z.number().positive(), // ✅ Need authId for authorization check
});

const outputSchema = z.object({});

export class DeleteGoodReceiptUsecase {
	constructor(
		private readonly goodReceiptRepo: GoodReceiptRepository,
		private readonly productRepo: ProductRepository,
		private readonly transactionManager: TransactionManager,
		private readonly employeeReadAccessor: EmployeeReadAccessor
	) {}

	async execute(input: any) {
		console.log('\n========== DELETE GOOD RECEIPT USECASE ==========');
		const parsedInput = inputSchema.parse(input);
		
		const log = logger.child({
			task: "Deleting good receipt",
			goodReceiptId: parsedInput.id,
			employeeId: parsedInput.authId,
		});
		log.info("Task started");

		// ✅ STEP 1: Verify employee authorization (RECEIVING or MANAGER)
		console.log('\n📦 STEP 1: Verify employee authorization');
		const employee = await this.employeeReadAccessor.getById(parsedInput.authId);
		console.log('Employee info:', { id: employee?.id, name: employee?.name, position: employee?.position });
		
		if (!employee) {
			log.warn("Task failed: employee not found");
			throw Error(`Employee ${parsedInput.authId} not found`);
		}
		
		// ✅ CRITICAL FIX: Allow both RECEIVING and MANAGER
		if (employee.position !== 'RECEIVING' && employee.position !== 'MANAGER') {
			log.warn("Task failed: employee not authorized", { position: employee.position });
			throw Error(`Employee position ${employee.position} not authorized for deleting good receipts. Required: RECEIVING or MANAGER`);
		}
		
		console.log('✅ Employee authorized:', { id: employee.id, position: employee.position });

		// ✅ STEP 2: Verify good receipt exists
		console.log('\n📦 STEP 2: Fetch existing good receipt');
		const existing = await this.goodReceiptRepo.getById(parsedInput.id);
		if (!existing) {
			log.warn("Task failed: good receipt not found");
			throw Error(`Good receipt with id ${parsedInput.id} not found`);
		}
		
		console.log('Existing receipt:', {
			id: existing.id,
			detailsCount: existing.goodReceiptDetails?.length || 0,
			details: existing.goodReceiptDetails,
		});

		// ✅ STEP 3: Fetch products and revert stock
		console.log('\n📦 STEP 3: Revert product stock');
		const details = existing.goodReceiptDetails || [];
		
		// ✅ CRITICAL FIX: Map details properly
		const productIdsAndQuantities = details
			.filter((d: any) => d != null)
			.map((d: any) => {
				// Access getters or private properties
				const productId = d.productId || d._productId;
				const quantity = d.quantity || d._quantity;
				
				console.log('  📦 Detail:', { productId, quantity });
				
				return { productId, quantity };
			})
			.filter(item => item.productId != null && item.quantity != null);
		
		console.log('Product IDs and quantities:', productIdsAndQuantities);

		if (productIdsAndQuantities.length === 0) {
			console.log('⚠️ No product details found, skipping stock revert');
			log.warn("No product details to revert");
		}

		const productIds = productIdsAndQuantities.map(item => item.productId);
		
		if (productIds.length > 0) {
			const products = await this.productRepo.getByIds(productIds);
			console.log('Products fetched:', products.map(p => ({
				id: p.id,
				name: p.name,
				amount: p.amount,
			})));

			// Build quantity map
			const quantityMap = new Map(
				productIdsAndQuantities.map(item => [item.productId, item.quantity])
			);

			// Revert stock
			for (const product of products) {
				const receivedQty = quantityMap.get(product.id) || 0;
				
				console.log(`📦 Product ${product.id} (${product.name}):`);
				console.log(`   Received quantity: ${receivedQty}`);
				console.log(`   Current stock: ${product.amount}`);
				
				if (product.amount < receivedQty) {
					log.warn("Cannot revert stock: insufficient stock", {
						productId: product.id,
						productName: product.name,
						currentStock: product.amount,
						requiredRevert: receivedQty,
					});
					
					throw Error(
						`Không thể xóa phiếu nhập hàng. Sản phẩm "${product.name}" không đủ tồn kho để hoàn trả. ` +
						`Tồn kho hiện tại: ${product.amount}, cần hoàn trả: ${receivedQty}`
					);
				}
				
				console.log(`   ⬇️ DECREASE stock by ${receivedQty}`);
				product.reduceStock(receivedQty);
				console.log(`   New stock: ${product.amount}`);
			}

			// ✅ STEP 4: Delete in transaction
			console.log('\n📦 STEP 4: Delete good receipt and update products');
			await this.transactionManager.transaction(async (tx) => {
				console.log('  💾 Updating products...');
				await this.productRepo.saveMany(products, tx);
				console.log('  ✅ Products updated');

				console.log('  🗑️ Deleting good receipt...');
				await this.goodReceiptRepo.delete(parsedInput.id, tx);
				console.log('  ✅ Good receipt deleted');
			});
		} else {
			// No products to revert, just delete
			console.log('\n📦 STEP 4: Delete good receipt (no products to revert)');
			await this.transactionManager.transaction(async (tx) => {
				await this.goodReceiptRepo.delete(parsedInput.id, tx);
				console.log('  ✅ Good receipt deleted');
			});
		}

		log.info("Task completed");
		console.log('========== DELETE USECASE COMPLETED ==========\n');
		
		return outputSchema.parse({});
	}
}
