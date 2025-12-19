import { Stocktaking } from "../../../domain/entities/stocktaking";
import z from "zod";
import { logger } from "../../../domain/services/logger.service";
import { ProductBarcode, ProductId } from "../../../domain/entities/product";
import { StocktakingRepository } from "../../repositories/stocktaking.repository";
import { ProductReadAccessor } from "../read-accessors/product.read-accessor";
import { ShelfReadAccessor } from "../read-accessors/shelf.read-accessor";

const inputSchema = z.object({
	id: z.number(),
	authId: z.number(),
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

export class UpdateStocktakingUsecase {
	constructor(
		private readonly productReadAccess: ProductReadAccessor,
		private readonly shelfReadAccess: ShelfReadAccessor,
		private readonly stocktakingRepo: StocktakingRepository
	) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Updating stock-taking",
			stocktakingId: parsedInput.id,
			employeeId: parsedInput.authId,
		});
		log.info("Task started");

		// Verify stocktaking exists
		const existing = await this.stocktakingRepo.getById(parsedInput.id);
		if (!existing) {
			log.warn("Task failed: stocktaking not found");
			throw Error(`Stocktaking with id ${parsedInput.id} not found`);
		}

		// Validate barcodes
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

		// Prepare new details
		const barcodeMap = new Map<ProductBarcode, ProductId>(
			idAndBarcodes.map((i) => [i.barcode, i.id])
		);
		const details = parsedInput.products.map((p) => ({
			status: p.status,
			quantity: p.quantity,
			productId: barcodeMap.get(p.barcode),
			slotId: p.slotId,
		}));

		// Update stocktaking
		const updated = await this.stocktakingRepo.update(
			parsedInput.id,
			parsedInput.authId,
			details
		);

		log.debug("Task saved", {
			stocktakingId: updated.id,
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
