import { ProductStatus } from "../generated/enums";

export class Stocktaking {
	private _id: number;
	private _employeeId: number;
	private _createdAt: Date;
	private _stocktakingDetails: StocktakingDetail[];

	private constructor() {}

	static create(
		employeeId: number,
		products: StocktakingDetailCreateInput[]
	) {
		let e = new Stocktaking();

		e._employeeId = employeeId;
		e._createdAt = new Date();
		e.recordDetail(products);

		return e;
	}

	static rehydrate({
		id,
		employeeId,
		createdAt,
		stocktakingDetails,
	}: {
		id: number;
		employeeId: number;
		createdAt: string;
		stocktakingDetails: StocktakingDetailRehydrateInput[];
	}) {
		let e = new Stocktaking();

		e._id = id;
		e._employeeId = employeeId;
		e._createdAt = new Date(createdAt);
		e._stocktakingDetails = stocktakingDetails.map(
			StocktakingDetail.rehydrate
		);

		return e;
	}

	recordDetail(products: StocktakingDetailCreateInput[]) {
		if (products.length < 1)
			throw Error(
				`Expect stocktaking to have at least one item, got ${products}`
			);

		this._stocktakingDetails = products.map(StocktakingDetail.create);
	}

	get id(): number {
		return this._id;
	}

	get employeeId(): number {
		return this._employeeId;
	}

	get createdAt(): Date {
		return this._createdAt;
	}

	get stocktakingDetails(): StocktakingDetail[] {
		return this._stocktakingDetails;
	}
}

type StocktakingDetailCreateInput = {
	productId: number;
	slotId: number;
	status: string;
	quantity: number;
};

type StocktakingDetailRehydrateInput = {
	id: number;
	stocktakingId: number;
	productId: number;
	slotId: number;
	status: string;
	quantity: number;
};

export class StocktakingDetail {
	private _id: number;
	private _stocktakingId: number;
	private _productId: number;
	private _slotId: number;
	private _status: ProductStatus;
	private _quantity: number;

	private constructor() {}

	static create({
		productId,
		slotId,
		status,
		quantity,
	}: StocktakingDetailCreateInput) {
		let e = new StocktakingDetail();

		e._productId = productId;
		e._slotId = slotId;
		e.updateStatus(status);
		e.updateQuantity(quantity);

		return e;
	}

	static rehydrate({
		id,
		stocktakingId,
		productId,
		slotId,
		status,
		quantity,
	}: StocktakingDetailRehydrateInput): StocktakingDetail {
		let e = new StocktakingDetail();

		e._id = id;
		e._stocktakingId = stocktakingId;
		e._productId = productId;
		e._slotId = slotId;
		e._status = status as ProductStatus;
		e._quantity = quantity;

		return e;
	}

	updateQuantity(quantity: number) {
		if (quantity < 0) throw Error(`Expect the quantity to be positive`);
		this._quantity = quantity;
	}

	updateStatus(status: string) {
		const statuses = Object.keys(ProductStatus);
		if (!statuses.includes(status))
			throw Error(`Expect a status in [${statuses}], got ${status}`);

		this._status = status as ProductStatus;
	}

	get productId(): number {
		return this._productId;
	}

	get slotId(): number {
		return this._slotId;
	}

	get status(): ProductStatus {
		return this._status;
	}

	get quantity(): number {
		return this._quantity;
	}
}
