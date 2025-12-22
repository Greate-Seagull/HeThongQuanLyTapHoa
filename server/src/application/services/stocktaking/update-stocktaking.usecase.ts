import z from "zod";
import { logger } from "../../../domain/services/logger.service";
import { StocktakingRepository } from "../../repositories/stocktaking.repository";
import { ProductReadAccessor } from "../read-accessors/product.read-accessor";
import { ShelfReadAccessor } from "../read-accessors/shelf.read-accessor";
import { EmployeeReadAccessor } from "../read-accessors/employee.read-accessor";

const inputSchema = z.object({
	id: z.number().positive(),
	authId: z.number().positive(),
	products: z.array(
		z.object({
			barcode: z.number().positive(),
			slotId: z.number().positive(),
			status: z.enum(['GOOD', 'EXPIRED']),
			quantity: z.number().positive(),
		})
	).min(1),
});

const outputSchema = z.object({});

export class UpdateStocktakingUsecase {
	constructor(
		private readonly employeeRead: EmployeeReadAccessor,
		private readonly productRead: ProductReadAccessor,
		private readonly shelfRead: ShelfReadAccessor,
		private readonly stocktakingRepo: StocktakingRepository
	) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		
		const log = logger.child({
			task: "Updating stocktaking",
			stocktakingId: parsedInput.id,
		});
		log.info("Task started");

		// Verify exists
		const existing = await this.stocktakingRepo.getById(parsedInput.id);
		if (!existing) {
			throw Error(`Stocktaking with id ${parsedInput.id} not found`);
		}

		// Verify employee
		const employee = await this.employeeRead.getById(parsedInput.authId);
		if (!employee || (employee.position !== 'INVENTORY' && employee.position !== 'MANAGER')) {
			throw Error('Employee not authorized');
		}

		// Validate products + slots
		const barcodes = parsedInput.products.map(p => p.barcode);
		const productMap = await this.productRead.getIdsByBarcodes(barcodes);
		if (productMap.length !== barcodes.length) {
			throw Error('Some products not found');
		}

		const slotIds = parsedInput.products.map(p => p.slotId);
		const slotsValid = await this.shelfRead.existSlotByIds(slotIds);
		if (!slotsValid) {
			throw Error('Some slots do not exist');
		}

		// Build details
		const barcodeToId = new Map(productMap.map(p => [p.barcode, p.id]));
		const details = parsedInput.products.map(p => ({
			productId: barcodeToId.get(p.barcode)!,
			slotId: p.slotId,
			status: p.status,
			quantity: p.quantity,
		}));

		await this.stocktakingRepo.update(parsedInput.id, parsedInput.authId, details);
		
		log.info("Task completed");
		return outputSchema.parse({});
	}
}
