import z from "zod";
import { logger } from "../../../domain/services/logger.service";
import { StocktakingRepository } from "../../repositories/stocktaking.repository";
import { ProductReadAccessor } from "../read-accessors/product.read-accessor";
import { ShelfReadAccessor } from "../read-accessors/shelf.read-accessor";
import { EmployeeReadAccessor } from "../read-accessors/employee.read-accessor";
import { Stocktaking } from "../../../domain/entities/stocktaking";
import { create } from "../../../domain/services/factory.service";

const inputSchema = z.object({
	authId: z.number().positive(),  // ✅ This is REAL EmployeeID (not EmployeeAccountID)
	products: z.array(
		z.object({
			barcode: z.number().positive(),
			slotId: z.number().positive(),
			status: z.enum(['GOOD', 'EXPIRED']),
			quantity: z.number().positive(),
		})
	).min(1),
});

const outputSchema = z.object({
	stocktakingId: z.number(),
});

export class CreateStocktakingUsecase {
	constructor(
		private readonly employeeRead: EmployeeReadAccessor,
		private readonly productRead: ProductReadAccessor,
		private readonly shelfRead: ShelfReadAccessor,
		private readonly stocktakingRepo: StocktakingRepository
	) {}

	async execute(input: any) {
		console.log('\n========== CREATE STOCKTAKING USECASE ==========');
		console.log('📥 Raw input:', input);
		
		const parsedInput = inputSchema.parse(input);
		
		console.log('📥 Parsed input:', {
			employeeId: parsedInput.authId,
			productsCount: parsedInput.products.length,
		});
		
		const log = logger.child({
			task: "Creating stocktaking",
			employeeId: parsedInput.authId,  // ✅ This is EmployeeID
		});
		log.info("Task started");

		// ✅ STEP 1: Verify employee (authId is EmployeeID)
		console.log('📦 STEP 1: Verify employee by ID:', parsedInput.authId);
		const employee = await this.employeeRead.getById(parsedInput.authId);
		
		if (!employee) {
			console.error('❌ Employee not found:', parsedInput.authId);
			throw Error(`Employee ${parsedInput.authId} not found`);
		}
		
		console.log('✅ Employee found:', {
			id: employee.id,
			name: employee.name,
			position: employee.position,
		});
		
		if (employee.position !== 'INVENTORY' && employee.position !== 'MANAGER') {
			console.error('❌ Employee not authorized:', employee.position);
			throw Error(`Employee position ${employee.position} not authorized. Required: INVENTORY or MANAGER`);
		}
		
		console.log('✅ Employee authorized');

		// ✅ STEP 2: Validate products by barcode
		console.log('\n📦 STEP 2: Validate products by barcode');
		const barcodes = parsedInput.products.map(p => p.barcode);
		console.log('Barcodes to validate:', barcodes);
		
		const productMap = await this.productRead.getIdsByBarcodes(barcodes);
		
		if (productMap.length !== barcodes.length) {
			const foundBarcodes = new Set(productMap.map(p => p.barcode));
			const missingBarcodes = barcodes.filter(b => !foundBarcodes.has(b));
			throw Error(`Products not found for barcodes: ${missingBarcodes.join(', ')}`);
		}
		
		console.log('✅ All products validated');

		// ✅ STEP 3: Validate slots
		console.log('\n📦 STEP 3: Validate slots');
		const slotIds = parsedInput.products.map(p => p.slotId);
		const slotsValid = await this.shelfRead.existSlotByIds(slotIds);
		
		if (!slotsValid) {
			throw Error('Some slots do not exist');
		}
		
		console.log('✅ All slots validated');

		// ✅ STEP 4: Create stocktaking entity
		console.log('\n📦 STEP 4: Create stocktaking entity');
		const barcodeToId = new Map(productMap.map(p => [p.barcode, p.id]));
		
		const details = parsedInput.products.map(p => ({
			productId: barcodeToId.get(p.barcode)!,
			slotId: p.slotId,
			status: p.status,
			quantity: p.quantity,
		}));
		
		const stocktaking = create(Stocktaking, {
			employeeId: parsedInput.authId,  // ✅ EmployeeID
			stocktakingDetails: details,
		});
		
		// ✅ CRITICAL FIX: Ensure createdAt is set
		if (!(stocktaking as any).createdAt) {
			console.log('⚠️ createdAt not set by entity, setting manually');
			(stocktaking as any)._createdAt = new Date();
		}
		
		console.log('✅ Stocktaking entity created:', {
			employeeId: (stocktaking as any).employeeId,
			createdAt: (stocktaking as any).createdAt,
			detailsCount: (stocktaking as any).stocktakingDetails.length,
		});

		// ✅ STEP 5: Save to database
		console.log('\n📦 STEP 5: Save stocktaking to database');
		const saved = await this.stocktakingRepo.add(stocktaking);
		
		log.info("Task completed", { stocktakingId: saved.id });
		console.log('========== CREATE USECASE COMPLETED ==========\n');
		
		return outputSchema.parse({ stocktakingId: saved.id });
	}
}
