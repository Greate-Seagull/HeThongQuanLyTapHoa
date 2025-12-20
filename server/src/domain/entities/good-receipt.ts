import { Read, Relation, Write } from "../../types/decorators";
import { BaseEntity } from "../abstracts/entity";
import { EmployeeId } from "./employee";
import { ProductId } from "./product";

export type GoodReceiptId = number | null;

// ✅ FIX: Export GoodReceiptDetail
export class GoodReceiptDetail {
	private _goodReceiptId: GoodReceiptId = null;
	private _productId: ProductId = null;
	private _quantity: number = 0;
	private _price: number = 0;

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
	set goodReceiptId(value: GoodReceiptId) {
		if (value != null && value <= 0) throw Error(`Invalid good receipt id, ${value}`);
		this._goodReceiptId = value;
	}
	
	set productId(value: number) {
		if (value <= 0) throw Error(`Invalid product id, ${value}`);
		this._productId = value;
	}
	
	set quantity(value: number) {
		if (value <= 0) throw Error(`Invalid quantity, ${value}`);
		this._quantity = value;
	}
	
	set price(value: number) {
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
	set employeeId(value: number) {
		if (value < 0) throw Error(`Invalid employee id, ${value}`);
		this._employeeId = value;
	}
	
	set goodReceiptDetails(value: GoodReceiptDetail[]) {
		this._goodReceiptDetails = value || [];
	}
	
	set createdAt(value: Date) {
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
		return this._goodReceiptDetails || [];
	}
}
