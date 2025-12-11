import { Optional, Read, Required, Type, Write } from "../types/decorators";
import { EmployeeId } from "./employee";
import { ProductId } from "./product";
import { PromotionId } from "./promotion";
import { User, UserId } from "./user";

export class InvoiceDetail {
	private _invoiceId: InvoiceId = null;
	private _productId: ProductId = null;
	private _quantity: number = 0;
	private _promotionId: PromotionId = null;

	private constructor() {}

	// Setters
	set invoiceId(value: InvoiceId) {
		this._invoiceId = value;
	}

	set productId(value: ProductId) {
		this._productId = value;
	}

	set quantity(value: number) {
		if (value < 0) throw Error(`Invalid quantity, ${value}`);
		this._quantity = value;
	}

	set promotionId(value: PromotionId) {
		this._promotionId = value;
	}

	// Getters
	@Read
	@Type(Number)
	get invoiceId(): InvoiceId {
		return this._invoiceId;
	}
	@Read
	@Write
	@Required
	@Type(Number)
	get productId(): ProductId {
		return this._productId;
	}
	@Read
	@Write
	@Required
	@Type(Number)
	get quantity(): number {
		return this._quantity;
	}
	@Read
	@Write
	@Optional
	@Type(Number)
	get promotionId(): PromotionId {
		return this._promotionId;
	}
}

export type InvoiceId = number | null;

export class Invoice {
	private _id: InvoiceId = null;
	private _employeeId: number = null;
	private _userId: number = null;
	private _usedPoint: number = 0;
	private _total: number = 0;
	private _invoiceDetails: InvoiceDetail[] = [];

	private constructor() {}

	public updateUserInfo(user: User, usedPoint: number): void {
		if (user) {
			this._userId = user.id;
			if (usedPoint) this._usedPoint = usedPoint;
		}
	}

	// Setters
	private set id(value: InvoiceId) {
		this._id = value;
	}

	private set employeeId(value: EmployeeId) {
		this._employeeId = value;
	}

	private set userId(value: UserId) {
		this._userId = value;
	}

	private set usedPoint(value: number) {
		if (value < 0) throw Error(`Invalid used point, ${value}`);
		this._usedPoint = value;
	}

	private set total(value: number) {
		if (value < 0) throw Error(`Invalid total, ${value}`);
		this._total = value;
	}

	private set invoiceDetails(value: InvoiceDetail[]) {
		this._invoiceDetails = value;
	}

	// Getters
	@Read
	@Type(Number)
	get id(): InvoiceId {
		return this._id;
	}
	@Read
	@Write
	@Required
	@Type(Number)
	get employeeId(): EmployeeId {
		return this._employeeId;
	}
	@Read
	@Write
	@Type(Number)
	get userId(): UserId {
		return this._userId;
	}
	@Read
	@Write
	@Type(Number)
	get usedPoint(): number {
		return this._usedPoint;
	}
	@Read
	@Write
	@Required
	@Type(Number)
	get total(): number {
		return this._total;
	}
	@Read
	@Write
	@Required
	@Type(InvoiceDetail)
	get invoiceDetails(): InvoiceDetail[] {
		return this._invoiceDetails;
	}
}
