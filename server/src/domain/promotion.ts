export class Promotion {
	private _id?: number;
	private _name!: string;
	private _description!: string;
	private _startedAt!: Date;
	private _endedAt!: Date;
	private _condition!: string;
	private _value!: number;
	private _promotionType!: PromotionType;
	private _promotionDetails: PromotionDetail[];

	private constructor() {}

	static create(input: PromotionCreateProps) {
		let output = new Promotion();

		output._name = input.name;
		output._description = input.description;
		output.updateDates(input.startedAt, input.endedAt);
		output._condition = input.condition;
		output.updateValue(input.value);
		output.updatePromotionType(input.promotionType);
		output.applyPromotionTo(input.productIds);

		return output;
	}

	private applyPromotionTo(productIds: number[]) {
		if (productIds.length < 1)
			throw Error(
				`Expect promotion to have at least one product Id, got ${productIds}`
			);

		this._promotionDetails = productIds.map(PromotionDetail.create);
	}

	static rehydrate(input: PromotionRehydrateProps) {
		let output = new Promotion();

		output._id = input.id;
		output._name = input.name;
		output._description = input.description;
		output._startedAt = input.startedAt;
		output._endedAt = input.endedAt;
		output._condition = input.condition;
		output._value = input.value;
		output._promotionType = input.promotionType as PromotionType;
		output._promotionDetails = input.promotionDetails.map(
			PromotionDetail.rehydrate
		);

		return output;
	}

	private updatePromotionType(promotionType: string) {
		let promotionTypes = Object.values(PromotionType);
		if (!promotionTypes.includes(promotionType as PromotionType))
			throw Error(
				`Expect promotion type in ${promotionTypes}, got ${promotionType}`
			);

		this._promotionType = promotionType as PromotionType;
	}

	private updateValue(value: number) {
		if (value <= 0)
			throw Error(
				`Expect promotion value to be greater than zero, got ${value}`
			);

		this._value = value;
	}

	private updateDates(startedAt: Date, endedAt: Date) {
		if (startedAt >= endedAt)
			throw Error(
				`Expect start date to be before end date; got start date: ${startedAt}, end date: ${endedAt}`
			);

		this._startedAt = startedAt;
		this._endedAt = endedAt;
	}

	get id() {
		return this._id;
	}
	get name(): string {
		return this._name;
	}
	get description(): string {
		return this._description;
	}
	get startedAt(): Date {
		return this._startedAt;
	}
	get endedAt(): Date {
		return this._endedAt;
	}
	get condition(): string {
		return this._condition;
	}
	get value(): number {
		return this._value;
	}
	get promotionType(): PromotionType {
		return this._promotionType;
	}
	get promotionDetails(): PromotionDetail[] {
		// Return a shallow copy to protect internal mutation
		return [...this._promotionDetails];
	}
}

export enum PromotionType {
	PERCENTAGE = "PERCENTAGE",
	FIXED = "FIXED",
}

export class PromotionDetail {
	private _productId: number;
	private _promotionId: number;

	private constructor() {}

	static create(input) {
		let output = new PromotionDetail();

		output._productId = input;

		return output;
	}

	static rehydrate(input) {
		let output = new PromotionDetail();

		output._productId = input.productId;
		output._promotionId = input.promotionId;

		return output;
	}

	get productId() {
		return this._productId;
	}
}

export interface PromotionCreateProps {
	name: string;
	description: string;
	startedAt: Date;
	endedAt: Date;
	condition: string;
	value: number;
	promotionType: string;
	productIds: number[];
}

export interface PromotionRehydrateProps {
	id: number;
	name: string;
	description: string;
	startedAt: Date;
	endedAt: Date;
	condition: string;
	value: number;
	promotionType: string;
	promotionDetails: [];
}
