import { ProductStatus } from "../generated/enums";
import { Read, Required, Type, Write } from "../types/decorators";
import { EmployeeId } from "./employee";
import { ProductId } from "./product";

export type StocktakingDetailId = number | null;

export class StocktakingDetail {
	private _id: StocktakingDetailId = null;
	private _stocktakingId: StocktakingId = null;
	private _productId: ProductId = null;
	private _slotId: number = null;
	private _status: ProductStatus = ProductStatus.GOOD;
	private _quantity: number = 0;

	private constructor() {}

	// Setters
	private set id(value: StocktakingDetailId) {
		this._id = value;
	}
	private set stocktakingId(value: StocktakingId) {
		this._stocktakingId = value;
	}
	private set productId(value: ProductId) {
		this._productId = value;
	}
	private set slotId(value: number) {
		this._slotId = value;
	}
	private set status(value: ProductStatus) {
		const statuses = Object.keys(ProductStatus);
		if (!statuses.includes(value))
			throw Error(`Expect a status in [${statuses}], got ${value}`);

		this._status = value;
	}
	private set quantity(value: number) {
		if (value < 0) throw Error(`Invalid quantity, ${value}`);
		this._quantity = value;
	}

	// Getters
	@Read
	@Type(Number)
	get id(): StocktakingDetailId {
		return this._id;
	}
	@Read
	@Type(Number)
	get stocktakingId(): StocktakingId {
		return this._stocktakingId;
	}
	@Read
	@Write
	@Required
	@Type(Number)
	get productId(): number {
		return this._productId;
	}
	@Read
	@Write
	@Required
	@Type(Number)
	get slotId(): number {
		return this._slotId;
	}
	@Read
	@Write
	@Required
	@Type(ProductStatus)
	get status(): ProductStatus {
		return this._status;
	}
	@Read
	@Write
	@Required
	@Type(Number)
	get quantity(): number {
		return this._quantity;
	}
}

export type StocktakingId = number | null;

export class Stocktaking {
	private _id: StocktakingId = null;
	private _employeeId: EmployeeId = null;
	private _createdAt: Date = new Date();
	private _stocktakingDetails: StocktakingDetail[] = [];

	private constructor() {}

	// Setters
	private set id(value: StocktakingId) {
		this._id = value;
	}

	private set employeeId(value: EmployeeId) {
		this._employeeId = value;
	}

	private set createdAt(value: Date) {
		this._createdAt = value;
	}

	private set stocktakingDetails(value: StocktakingDetail[]) {
		if (value.length < 1)
			throw Error(`Expect promotion to have at least one product Id`);
		this._stocktakingDetails = value;
	}

	// Getters
	@Read
	@Type(Number)
	get id(): StocktakingId {
		return this._id;
	}
	@Read
	@Write
	@Required
	@Type(Number)
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
	@Required
	@Type(StocktakingDetail)
	get stocktakingDetails(): StocktakingDetail[] {
		return this._stocktakingDetails;
	}
}
