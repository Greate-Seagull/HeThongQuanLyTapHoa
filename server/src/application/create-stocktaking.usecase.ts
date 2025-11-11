import { Stocktaking } from "../domain/stocktaking";
import { EmployeeReadAccess as EmployeeReadAccessor } from "../infrastructure/read-accessors/employee.read-accessor";
import { ProductReadAccessor } from "../infrastructure/read-accessors/product.read-accessor";
import { ShelfReadAccessor } from "../infrastructure/read-accessors/shelf.read-accessor";
import { StocktakingRepository } from "../infrastructure/repositories/stocktaking.repository";

export interface CreateStocktakingUsecaseInput {
	employeeId: number;
	products: {
		barcode: number;
		slotId: number;
		status: string;
		quantity: number;
	}[];
}

export class CreateStocktakingUsecase {
	constructor(
		private readonly employeeReadAccess: EmployeeReadAccessor,
		private readonly productReadAccess: ProductReadAccessor,
		private readonly shelfReadAccess: ShelfReadAccessor,
		private readonly stocktakingRepo: StocktakingRepository
	) {}

	async execute(input: CreateStocktakingUsecaseInput) {
		const isEmployeeValid = await this.employeeReadAccess.existById(
			input.employeeId
		);
		if (!isEmployeeValid)
			throw Error(`Employee not found, ${input.employeeId}`);

		const ids = await this.productReadAccess.getIdsByBarcodes(
			input.products.map((p) => p.barcode)
		);
		if (ids.length != input.products.length)
			throw Error(`Expect all products to be valid`);

		const slotIds = this.getDistinctSlotIds(input.products);
		const areSlotsValid = await this.shelfReadAccess.existSlotByIds(
			slotIds
		);
		if (!areSlotsValid) throw Error(`Expect all slots to be valid`);

		const barcodeMap = new Map<number, number>(
			ids.map((p) => [p.barcode, p.id])
		);
		const stockDetailInputs = input.products.map((p) => ({
			productId: barcodeMap.get(p.barcode),
			slotId: p.slotId,
			status: p.status,
			quantity: p.quantity,
		}));
		const stocktaking = Stocktaking.create(
			input.employeeId,
			stockDetailInputs
		);

		const save = await this.stocktakingRepo.add(null, stocktaking);

		return { message: "Success" };
	}

	getDistinctSlotIds(items: any[]) {
		let ids = new Set<number>();
		for (const item of items) {
			if (item.slotId) ids.add(item.slotId);
		}
		return [...ids];
	}
}
