import { Stocktaking } from "../../../domain/entities/stocktaking";
import z from "zod";
import { logger } from "../../../domain/services/logger.service";
import { ProductBarcode, ProductId } from "../../../domain/entities/product";
import { StocktakingRepository } from "../../repositories/stocktaking.repository";
import { ProductReadAccessor } from "../read-accessors/product.read-accessor";
import { ShelfReadAccessor } from "../read-accessors/shelf.read-accessor";

const inputSchema = z.object({
	authId: z.number(), // EmployeeId from authenticated user
	products: z.array(
		z.object({
			barcode: z.number(),
			slotId: z.number(),
			status: z.string(),
			quantity: z.number(),
		})
	),
});

const outputSchema = z.object({});

export class CreateStocktakingUsecase {
	constructor(
		private readonly productReadAccess: ProductReadAccessor,
		private readonly shelfReadAccess: ShelfReadAccessor,
		private readonly stocktakingRepo: StocktakingRepository
	) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
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
		if (idAndBarcodes.length != barcodes.length) {
			log.warn("Task failed: invalid product id");
			throw Error(`Expect all products to be valid`);
		}

		// Validate slots
		const slotIds = this.getDistinctSlotIds(parsedInput.products);
		const areSlotsValid = await this.shelfReadAccess.existSlotByIds(
			slotIds
		);
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
			productId: barcodeMap.get(p.barcode),
			slotId: p.slotId,
		}));
		
		// ✅ FIX: Use authId (employeeId from authenticated user)
		const stocktaking = Stocktaking.create(parsedInput.authId, details);

		const save = await this.stocktakingRepo.add(stocktaking);
		
		log.debug("Task saved", {
			stocktakingId: save.id,
			employeeId: save.employeeId, // Log the saved employeeId
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
