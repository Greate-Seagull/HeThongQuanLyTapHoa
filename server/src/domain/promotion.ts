import { Optional, Read, Required, Type, Write } from "../types/decorators";
import { Product, ProductId } from "./product";
import { create } from "./services/factory.service";

export enum PromotionType {
	PERCENTAGE = "PERCENTAGE",
	FIXED = "FIXED",
}

export class PromotionDetail {
	private _promotionId: PromotionId;
	private _productId: ProductId;

	private constructor() {}

	// Setters
	private set promotionId(value: PromotionId) {
		this._promotionId = value;
	}
	private set productId(value: ProductId) {
		this._productId = value;
	}

	// Getters
	@Read
	@Type(Number)
	get promotionId(): PromotionId {
		return this._promotionId;
	}
	@Read
	@Write
	@Required
	@Type(Number)
	get productId(): ProductId {
		return this._productId;
	}
}

export type PromotionId = number | null;

export class Promotion {
	private _id: PromotionId = null;
	private _name: string = null;
	private _description: string = null;
	private _startedAt: Date = new Date();
	private _endedAt: Date = new Date();
	private _condition: string = null;
	private _value: number = 0;
	private _promotionType: PromotionType = PromotionType.FIXED;
	private _promotionDetails: PromotionDetail[] = [];

	private constructor() {}

	static create(input: any) {
		const entity = create(Promotion, input);
		entity.updateDates(entity.startedAt, entity.endedAt);

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
	private set id(value: PromotionId) {
		this._id = value;
	}

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
	@Type(Number)
	get id(): PromotionId {
		return this._id;
	}
	@Read
	@Write
	@Required
	@Type(String)
	get name(): string {
		return this._name;
	}
	@Read
	@Write
	@Optional
	@Type(String)
	get description(): string {
		return this._description;
	}
	@Read
	@Write
	@Required
	@Type(Date)
	get startedAt(): Date {
		return this._startedAt;
	}
	@Read
	@Write
	@Required
	@Type(Date)
	get endedAt(): Date {
		return this._endedAt;
	}
	@Read
	@Write
	@Optional
	@Type(String)
	get condition(): string {
		return this._condition;
	}
	@Read
	@Write
	@Required
	@Type(Number)
	get value(): number {
		return this._value;
	}
	@Read
	@Write
	@Required
	@Type(PromotionType)
	get promotionType(): PromotionType {
		return this._promotionType;
	}
	@Read
	@Write
	@Required
	@Type(PromotionDetail)
	get promotionDetails(): PromotionDetail[] {
		// Return a shallow copy to protect internal mutation
		return [...this._promotionDetails];
	}
}
