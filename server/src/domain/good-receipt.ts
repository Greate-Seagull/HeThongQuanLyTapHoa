export class GoodReceipt {
	private _id?: number;
	private _employeeId!: number;
	private _createdAt!: Date;
	private _goodReceiptDetails: GoodReceiptDetail[];

	private constructor() {}

	static create(
		employeeId: number,
		items: { productId: number; quantity: number; price: number }[]
	) {
		let e = new GoodReceipt();

		e._employeeId = employeeId;
		e._createdAt = new Date();
		e.recordDetail(items);

		return e;
	}

	static rehydrate(raw: any) {
		let e = new GoodReceipt();

		e._id = raw.id;
		e._employeeId = raw.employeeId;
		e._createdAt = raw.createdAt;
		e._goodReceiptDetails = raw.goodReceiptDetails.map(
			GoodReceiptDetail.rehydrate
		);

		return e;
	}

	private recordDetail(
		items: { productId: number; quantity: number; price: number }[]
	) {
		this._goodReceiptDetails = items.map(GoodReceiptDetail.create);
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
	get goodReceiptDetails(): GoodReceiptDetail[] {
		return this._goodReceiptDetails;
	}
}

export class GoodReceiptDetail {
	private _goodReceiptId?: number;
	private _productId!: number;
	private _quantity!: number;
	private _price!: number;

	private constructor() {}

	static create({
		productId,
		quantity,
		price,
	}: {
		productId: number;
		quantity: number;
		price: number;
	}): GoodReceiptDetail {
		let e = new GoodReceiptDetail();

		e._productId = productId;
		e._quantity = quantity;
		e.updateCost(price);

		return e;
	}

	static rehydrate(raw: any) {
		let e = new GoodReceiptDetail();

		e._goodReceiptId = raw.goodReceiptId;
		e._productId = raw.productId;
		e._quantity = raw.quantity;
		e._price = raw.price;

		return e;
	}

	private updateCost(price: number) {
		if (price <= 0) throw Error(`Expect the import cost to be positive`);
		this._price = price;
	}

	get productId(): number {
		return this._productId;
	}
	get quantity(): number {
		return this._quantity;
	}
	get price(): number {
		return this._price;
	}
}
