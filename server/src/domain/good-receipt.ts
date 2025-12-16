import { Read, Required, Type, Write } from "../types/decorators";

export type GoodReceiptId = number | null;

export class GoodReceiptDetail {
	private _goodReceiptId: GoodReceiptId = null;
	private _productId: number = null;
	private _quantity: number = null;
	private _price: number = null;

	private constructor() {}

	// Setters
	private set goodReceiptId(value: GoodReceiptId) {
		if (value <= 0) throw Error(`Invalid good receipt id, ${value}`);

		this._goodReceiptId = value;
	}
	private set productId(value: number) {
		if (value <= 0) throw Error(`Invalid product id, ${value}`);

		this._productId = value;
	}
	private set quantity(value: number) {
		if (value <= 0) throw Error(`Invalid quantity, ${value}`);

		this._quantity = value;
	}
	private set price(value: number) {
		if (value <= 0) throw Error(`Invalid price, ${value}`);

		this._price = value;
	}

	// Getters
	@Read
	@Type(Number)
	get goodReceiptId(): GoodReceiptId {
		return this._goodReceiptId;
	}
	@Read
	@Write
	@Type(Number)
	@Required
	get productId(): number {
		return this._productId;
	}
	@Read
	@Write
	@Type(Number)
	@Required
	get quantity(): number {
		return this._quantity;
	}
	@Read
	@Write
	@Type(Number)
	@Required
	get price(): number {
		return this._price;
	}
}

export class GoodReceipt {
	private _id: number = null;
	private _employeeId: number = null;
	private _createdAt: Date = new Date();
	private _goodReceiptDetails: GoodReceiptDetail[] = [];

	private constructor() {}

	// Setters
	private set employeeId(value: number) {
		if (value < 0) throw Error(`Invalid employee id, ${value}`);
		this._employeeId = value;
	}
	private set goodReceiptDetails(value: GoodReceiptDetail[]) {
		this._goodReceiptDetails = value;
	}

	// Getters
	@Read
	@Type(Number)
	get id(): number {
		return this._id;
	}
	@Read
	@Write
	@Type(Number)
	@Required
	get employeeId(): number {
		return this._employeeId;
	}
	@Read
	@Write
	@Type(Date)
	get createdAt(): Date {
		return this._createdAt;
	}
	@Read
	@Write
	@Type(GoodReceiptDetail)
	@Required
	get goodReceiptDetails(): GoodReceiptDetail[] {
		return this._goodReceiptDetails;
	}
}
