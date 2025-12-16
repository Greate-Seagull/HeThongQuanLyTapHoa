import { Read, Relation, Write } from "../../types/decorators";
import { BaseEntity } from "../abstracts/entity";
import { EmployeeId } from "./employee";
import { ProductId } from "./product";
import { PromotionId } from "./promotion";
import { User, UserId } from "./user";

export class InvoiceDetail {
	private _invoiceId: InvoiceId = null;
	private _productId: ProductId = null;
	private _quantity: number = 0;
	private _promotionId: PromotionId = null;

	public constructor() {}

	public static create(
		quantity: number,
		productId: ProductId,
		promotionId?: PromotionId
	) {
		let entity = new InvoiceDetail();
		entity.quantity = quantity;
		entity.productId = productId;
		entity.promotionId = promotionId;
		return entity;
	}

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
	get invoiceId(): InvoiceId {
		return this._invoiceId;
	}
	@Read
	@Write
	get productId(): ProductId {
		return this._productId;
	}
	@Read
	@Write
	get quantity(): number {
		return this._quantity;
	}
	@Read
	@Write
	get promotionId(): PromotionId {
		return this._promotionId;
	}
}

export type InvoiceId = number | null;

export class Invoice extends BaseEntity<InvoiceId> {
	private _employeeId: EmployeeId = null;
	private _userId: UserId = null;
	private _usedPoint: number = 0;
	private _total: number = 0;
	private _invoiceDetails: InvoiceDetail[] = [];

	static create(
		total: number,
		details: {
			quantity: number;
			productId: ProductId;
			promotionId?: PromotionId;
		}[],
		emloyeeId: EmployeeId,
		userId?: UserId,
		usedPoint?: number
	) {
		let entity = new Invoice();
		entity.total = total;
		entity.invoiceDetails = details.map((detail) =>
			InvoiceDetail.create(
				detail.quantity,
				detail.productId,
				detail.promotionId
			)
		);
		entity.employeeId = emloyeeId;
		entity.updateUserInfo(userId, usedPoint);
		return entity;
	}

	public updateUserInfo(userId?: UserId, usedPoint?: number): void {
		if (userId) {
			this.userId = userId;
			this.usedPoint = usedPoint || 0;
		}
	}

	// Setters
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
	@Write
	get employeeId(): EmployeeId {
		return this._employeeId;
	}
	@Read
	@Write
	get userId(): UserId {
		return this._userId;
	}
	@Read
	@Write
	get usedPoint(): number {
		return this._usedPoint;
	}
	@Read
	@Write
	get total(): number {
		return this._total;
	}
	@Read
	@Write
	@Relation(InvoiceDetail)
	get invoiceDetails(): InvoiceDetail[] {
		return this._invoiceDetails;
	}
}
