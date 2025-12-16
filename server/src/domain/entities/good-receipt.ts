import { Read, Relation, Write } from "../../types/decorators";
import { BaseEntity } from "../abstracts/entity";
import { EmployeeId } from "./employee";
import { ProductId } from "./product";

export type GoodReceiptId = number | null;

export class GoodReceiptDetail {
	private _goodReceiptId: GoodReceiptId = null;
	private _productId: ProductId = null;
	private _quantity: number = null;
	private _price: number = null;

	public static create(
		quantity: number,
		price: number,
		productId: ProductId
	) {
		const goodReceiptDetail = new GoodReceiptDetail();
		goodReceiptDetail.quantity = quantity;
		goodReceiptDetail.price = price;
		goodReceiptDetail.productId = productId;
		return goodReceiptDetail;
	}

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
	get goodReceiptId(): GoodReceiptId {
		return this._goodReceiptId;
	}
	@Read
	@Write
	get productId(): number {
		return this._productId;
	}
	@Read
	@Write
	get quantity(): number {
		return this._quantity;
	}
	@Read
	@Write
	get price(): number {
		return this._price;
	}
}

export class GoodReceipt extends BaseEntity<GoodReceiptId> {
	private _employeeId: EmployeeId = null;
	private _createdAt: Date = new Date();
	private _goodReceiptDetails: GoodReceiptDetail[] = [];

	public static create(
		employeeId: EmployeeId,
		details: {
			quantity: number;
			price: number;
			productId: ProductId;
		}[]
	) {
		const goodReceipt = new GoodReceipt();
		goodReceipt.employeeId = employeeId;
		goodReceipt.goodReceiptDetails = details.map((detail) =>
			GoodReceiptDetail.create(
				detail.quantity,
				detail.price,
				detail.productId
			)
		);
		goodReceipt.createdAt = new Date();
		return goodReceipt;
	}

	// Setters
	private set employeeId(value: number) {
		if (value < 0) throw Error(`Invalid employee id, ${value}`);
		this._employeeId = value;
	}
	private set goodReceiptDetails(value: GoodReceiptDetail[]) {
		this._goodReceiptDetails = value;
	}
	private set createdAt(value: Date) {
		this._createdAt = value;
	}

	// Getters
	@Read
	@Write
	get employeeId(): number {
		return this._employeeId;
	}
	@Read
	@Write
	get createdAt(): Date {
		return this._createdAt;
	}
	@Read
	@Write
	@Relation(GoodReceiptDetail)
	get goodReceiptDetails(): GoodReceiptDetail[] {
		return this._goodReceiptDetails;
	}
}
