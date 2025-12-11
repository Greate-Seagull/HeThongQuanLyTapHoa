import { Read, Required, Type, Write } from "../types/decorators";

export type ProductId = number | null;
export type ProductBarcode = number | null;

export enum ProductUnit {
	UNKNOWN = "UNKNOWN",
}

export class Product {
	private _id: ProductId = null;
	private _name: string = null;
	private _price: number = 0;
	private _unit: ProductUnit = ProductUnit.UNKNOWN;
	private _barcode: number = null;
	private _amount: number = 0;

	private constructor() {}

	updateBarcode(barcode: number) {
		this.barcode = barcode;
	}

	updateUnit(unit: string) {
		this.unit = unit as ProductUnit;
	}

	updatePrice(price: number) {
		this.price = price;
	}

	updateName(name: string) {
		this.name = name;
	}

	sellStock(quantity: number) {
		if (quantity <= 0) throw Error(`Invalid sold quantity, ${quantity}`);
		this.amount -= quantity;
	}

	receiveStock(quantity: any) {
		if (quantity <= 0)
			throw Error(`Invalid received quantity, ${quantity}`);
		this.amount += quantity;
	}

	// Setters
	private set price(value: ProductId) {
		if (value <= 0) throw Error(`Invalid price, ${value}`);
		this._price = value;
	}
	private set amount(value: number) {
		if (value < 0) throw Error(`Invalid quantity, ${value}`);
		this._amount = value;
	}
	private set name(value: string) {
		this._name = value;
	}
	private set unit(value: ProductUnit) {
		const types = Object.keys(ProductUnit);
		if (!types.includes(value)) throw Error(`Invalid unit, ${value}`);

		this._unit = value as ProductUnit;
	}
	private set barcode(value: number) {
		if (value <= 0) throw Error(`Invalid barcode, ${value}`);
		this._barcode = value;
	}

	// Getters
	@Read
	@Type(Number)
	public get id(): ProductId {
		return this._id;
	}
	@Read
	@Write
	@Required
	@Type(Number)
	public get price(): number {
		return this._price;
	}
	@Read
	@Write
	@Type(Number)
	public get amount(): number {
		return this._amount;
	}
	@Read
	@Write
	@Required
	@Type(String)
	public get name(): string {
		return this._name;
	}
	@Read
	@Write
	@Required
	@Type(ProductUnit)
	public get unit(): ProductUnit {
		return this._unit;
	}
	@Read
	@Write
	@Required
	@Type(Number)
	public get barcode(): number {
		return this._barcode;
	}
}

export enum ProductStatus {
	GOOD = "GOOD",
	EXPIRED = "EXPIRED",
}
