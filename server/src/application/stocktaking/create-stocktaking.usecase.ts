import { Stocktaking } from "../../domain/stocktaking";
import { ProductReadAccessor } from "../../infrastructure/read-accessors/product.read-accessor";
import { ShelfReadAccessor } from "../../infrastructure/read-accessors/shelf.read-accessor";
import { StocktakingRepository } from "../../infrastructure/repositories/stocktaking.repository";
import { EmployeeReadAccess } from "../../infrastructure/read-accessors/employee.read-accessor";
import z from "zod";
import { logger } from "../../domain/services/logger.service";
import { create } from "../../domain/services/factory.service";

const inputSchema = z.object({
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

const outputSchema = z.object();

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

		const barcodes = parsedInput.products.map((p) => p.barcode);
		const idAndBarcodes = await this.productReadAccess.getIdsByBarcodes(
			barcodes
		);
		if (idAndBarcodes.length != barcodes.length) {
			log.warn("Task failed: invalid product id");
			throw Error(`Expect all products to be valid`);
		}

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

		const barcodeMap = new Map<number, number>(
			idAndBarcodes.map((i) => [i.barcode, i.id])
		);
		const stocktaking = create(Stocktaking, {
			employeeId: parsedInput.authId,
			stocktakingDetails: parsedInput.products.map((p) => ({
				productId: barcodeMap.get(p.barcode),
				slotId: p.slotId,
				status: p.status,
				quantity: p.quantity,
			})),
		});

		const save = await this.stocktakingRepo.add(null, stocktaking);
		log.debug("Task saved", {
			stocktakingId: save.id,
		});

		log.info("Task completed");
		return outputSchema.parse({});
	}

	getDistinctSlotIds(items: any[]) {
		let ids = new Set<number>();
		for (const item of items) {
			if (item.slotId) ids.add(item.slotId);
		}
		return [...ids];
	}
}
