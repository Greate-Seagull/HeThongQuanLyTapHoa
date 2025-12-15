import { Read, Relation, Write } from "../../types/decorators";
import { BaseEntity } from "../abstracts/entity";
import { Product, ProductId } from "./product";

export enum PromotionType {
	PERCENTAGE = "PERCENTAGE",
	FIXED = "FIXED",
}

export class PromotionDetail {
	private _promotionId: PromotionId;
	private _productId: ProductId;

	public constructor() {}

	public static create(productId: ProductId) {
		let entity = new PromotionDetail();
		entity.productId = productId;
		return entity;
	}

	// Setters
	private set promotionId(value: PromotionId) {
		this._promotionId = value;
	}
	private set productId(value: ProductId) {
		this._productId = value;
	}

	// Getters
	@Read
	get promotionId(): PromotionId {
		return this._promotionId;
	}
	@Read
	@Write
	get productId(): ProductId {
		return this._productId;
	}
}

export type PromotionId = number | null;

export class Promotion extends BaseEntity<PromotionId> {
	private _name: string = null;
	private _description: string = null;
	private _startedAt: Date = new Date();
	private _endedAt: Date = new Date();
	private _condition: string = null;
	private _value: number = 0;
	private _promotionType: PromotionType = PromotionType.FIXED;
	private _promotionDetails: PromotionDetail[] = [];

	static create(
		name: string,
		startedAt: Date,
		endedAt: Date,
		value: number,
		promotionType: string,
		productIds: ProductId[],
		description?: string,
		condition?: string
	) {
		let entity = new Promotion();
		entity.name = name;
		entity.value = value;
		entity.promotionType = promotionType as PromotionType;
		entity.description = description;
		entity.condition = condition;
		entity.updateDates(startedAt, endedAt);
		entity.promotionDetails = productIds.map(PromotionDetail.create);

		return entity;
	}

	private updateDates(startedAt: Date, endedAt: Date) {
		if (startedAt >= endedAt)
			throw Error(
				`Expect start date to be before end date; got start date: ${startedAt}, end date: ${endedAt}`
			);

		this._startedAt = startedAt;
		this._endedAt = endedAt;
	}

	public isActive(date: Date): boolean {
		return date >= this.startedAt && date <= this.endedAt;
	}

	public calculateDiscount(basePrice: number): number {
		switch (this.promotionType) {
			case PromotionType.FIXED:
				return this.value;
			case PromotionType.PERCENTAGE:
				return this.value * basePrice;
			default:
				throw Error(
					`Expect a valid promotion type, got ${this.promotionType}`
				);
		}
	}

	public applyDiscount(product: Product): number {
		const searchedDetails = this._promotionDetails.filter(
			(pd) => pd.productId == product.id
		);
		if (searchedDetails.length != 1)
			throw Error(
				`The promotion ${this._id} cannot apply to the product ${product.id}`
			);

		return product.price - this.calculateDiscount(product.price);
	}

	// Setters
	private set name(value: string) {
		this._name = value;
	}

	private set description(value: string) {
		this._description = value;
	}

	private set startedAt(value: Date) {
		this._startedAt = value;
	}

	private set endedAt(value: Date) {
		this._endedAt = value;
	}

	private set condition(value: string) {
		this._condition = value;
	}

	private set value(value: number) {
		if (value < 0) throw Error(`Invalid value, ${value}`);
		this._value = value;
	}

	private set promotionType(value: PromotionType) {
		const types = Object.keys(PromotionType);
		if (!types.includes(value))
			throw Error(`Invalid promotion type, ${value}`);
		this._promotionType = value;
	}

	private set promotionDetails(value: PromotionDetail[]) {
		if (value.length < 1)
			throw Error(`Expect promotion to have at least one product Id`);
		this._promotionDetails = value;
	}

	// Getters
	@Read
	@Write
	get name(): string {
		return this._name;
	}
	@Read
	@Write
	get description(): string {
		return this._description;
	}
	@Read
	@Write
	get startedAt(): Date {
		return this._startedAt;
	}
	@Read
	@Write
	get endedAt(): Date {
		return this._endedAt;
	}
	@Read
	@Write
	get condition(): string {
		return this._condition;
	}
	@Read
	@Write
	get value(): number {
		return this._value;
	}
	@Read
	@Write
	get promotionType(): PromotionType {
		return this._promotionType;
	}
	@Read
	@Write
	@Relation(PromotionDetail)
	get promotionDetails(): PromotionDetail[] {
		// Return a shallow copy to protect internal mutation
		return [...this._promotionDetails];
	}
}
