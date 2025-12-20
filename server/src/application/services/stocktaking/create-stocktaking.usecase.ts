import { Stocktaking } from "../../../domain/entities/stocktaking";
import z from "zod";
import { logger } from "../../../domain/services/logger.service";
import { ProductBarcode, ProductId } from "../../../domain/entities/product";
import { StocktakingRepository } from "../../repositories/stocktaking.repository";
import { ProductReadAccessor } from "../read-accessors/product.read-accessor";
import { ShelfReadAccessor } from "../read-accessors/shelf.read-accessor";

const inputSchema = z.object({
	authId: z.number().positive(), // ✅ Must be positive number
	products: z.array(
		z.object({
			barcode: z.number().positive(), // ✅ Must be positive number
			slotId: z.number().positive(),  // ✅ Must be positive number
			status: z.enum(["GOOD", "EXPIRED"]),  // ✅ Must be exact string
			quantity: z.number().positive(), // ✅ Must be positive number
		})
	).min(1), // ✅ Must have at least 1 product
});

const outputSchema = z.object({});

export class CreateStocktakingUsecase {
	constructor(
		private readonly productReadAccess: ProductReadAccessor,
		private readonly shelfReadAccess: ShelfReadAccessor,
		private readonly stocktakingRepo: StocktakingRepository
	) {}

	async execute(input: any) {
		// ✅ Enhanced error logging for validation
		console.log('📥 CreateStocktakingUsecase received:', JSON.stringify(input, null, 2));
		
		try {
			var parsedInput = inputSchema.parse(input);
			console.log('✅ Input validation passed');
		} catch (error: any) {
			console.error('❌ Validation error:', {
				message: error.message,
				issues: error.issues,
				receivedInput: input,
			});
			
			// Better error message
			if (error.issues && error.issues.length > 0) {
				const firstIssue = error.issues[0];
				throw new Error(`Validation failed at ${firstIssue.path.join('.')}: ${firstIssue.message}`);
			}
			
			throw new Error(`Validation error: ${error.message}`);
		}
		
		const log = logger.child({
			task: "Creating stock-taking",
			employeeId: parsedInput.authId,
		});
		log.info("Task started");

		// Validate products
		const barcodes = parsedInput.products.map((p) => p.barcode);
		const idAndBarcodes = await this.productReadAccess.getIdsByBarcodes(
			barcodes
		);
		
		console.log('🔍 Found products:', { 
			requested: barcodes, 
			found: idAndBarcodes.map(i => i.barcode) 
		});
		
		if (idAndBarcodes.length != barcodes.length) {
			log.warn("Task failed: invalid product id");
			throw Error(`Expect all products to be valid. Found ${idAndBarcodes.length} out of ${barcodes.length}`);
		}

		// Validate slots
		const slotIds = this.getDistinctSlotIds(parsedInput.products);
		const areSlotsValid = await this.shelfReadAccess.existSlotByIds(
			slotIds
		);
		
		console.log('🔍 Validating slots:', { slotIds, valid: areSlotsValid });
		
		if (!areSlotsValid) {
			log.warn("Task failed: invalid slot id");
			throw Error(`Expect all slots to be valid`);
		}
		
		log.debug("Task validated", {
			barcodes: barcodes,
			slotIds: slotIds,
		});

		// Map barcodes to product IDs
		const barcodeMap = new Map<ProductBarcode, ProductId>(
			idAndBarcodes.map((i) => [i.barcode, i.id])
		);
		
		// Prepare stocktaking details
		const details = parsedInput.products.map((p) => ({
			status: p.status,
			quantity: p.quantity,
			productId: barcodeMap.get(p.barcode)!,
			slotId: p.slotId,
		}));
		
		console.log('📦 Creating stocktaking entity:', {
			employeeId: parsedInput.authId,
			detailsCount: details.length,
		});
		
		// Create entity
		const stocktaking = Stocktaking.create(parsedInput.authId, details);

		const save = await this.stocktakingRepo.add(stocktaking);
		
		log.debug("Task saved", {
			stocktakingId: save.id,
			employeeId: save.employeeId,
		});

		log.info("Task completed");
		return outputSchema.parse({});
	}

	getDistinctSlotIds(items: any[]) {
		const ids = new Set<number>();
		for (const item of items) {
			if (item.slotId) ids.add(item.slotId);
		}
		return [...ids];
	}
}
