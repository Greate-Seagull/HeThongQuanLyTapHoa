import { ProductStatus } from "../../generated/enums";
import { Read, Required, Relation, Write } from "../../types/decorators";
import { BaseEntity } from "../abstracts/entity";
import { EmployeeId } from "./employee";
import { ProductId } from "./product";

export type StocktakingDetailId = number | null;

export class StocktakingDetail extends BaseEntity<StocktakingDetailId> {
	private _stocktakingId: StocktakingId = null;
	private _productId: ProductId = null;
	private _slotId: number = null;
	private _status: ProductStatus = ProductStatus.GOOD;
	private _quantity: number = 0;

	public static create(
		status: string,
		quantity: number,
		productId: ProductId,
		slotId: number
	) {
		const stocktakingDetail = new StocktakingDetail();
		stocktakingDetail.status = status as ProductStatus;
		stocktakingDetail.quantity = quantity;
		stocktakingDetail.productId = productId;
		stocktakingDetail.slotId = slotId;
		return stocktakingDetail;
	}

	// Setters
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
	get stocktakingId(): StocktakingId {
		return this._stocktakingId;
	}
	@Read
	@Write
	get productId(): number {
		return this._productId;
	}
	@Read
	@Write
	get slotId(): number {
		return this._slotId;
	}
	@Read
	@Write
	get status(): ProductStatus {
		return this._status;
	}
	@Read
	@Write
	get quantity(): number {
		return this._quantity;
	}
}

export type StocktakingId = number | null;

export class Stocktaking extends BaseEntity<StocktakingId> {
	private _employeeId: EmployeeId = null;
	private _createdAt: Date = new Date();
	private _stocktakingDetails: StocktakingDetail[] = [];

	public static create(
		employeeId: EmployeeId,
		details: {
			status: string;
			quantity: number;
			productId: ProductId;
			slotId: number;
		}[]
	) {
		const stocktaking = new Stocktaking();
		stocktaking.employeeId = employeeId;
		stocktaking.createdAt = new Date();
		stocktaking.stocktakingDetails = details.map((d) =>
			StocktakingDetail.create(
				d.status,
				d.quantity,
				d.productId,
				d.slotId
			)
		);
		stocktaking.createdAt = new Date();
		return stocktaking;
	}

	// Setters
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
	@Relation(StocktakingDetail)
	get stocktakingDetails(): StocktakingDetail[] {
		return this._stocktakingDetails;
	}
}
