import e from "express";

export class Product {
	private _id?: number;
	private _name!: string;
	private _price!: number;
	private _unit!: ProductUnit;
	private _barcode!: number;
	private _amount!: number;

	static create({
		name,
		price,
		unit,
		barcode,
	}: {
		name: string;
		price: number;
		unit: string;
		barcode: number;
	}) {
		let e = new Product();

		e.updateName(name);
		e.updatePrice(price);
		e.updateUnit(unit);
		e.updateBarcode(barcode);
		e._amount = 0;

		return e;
	}

	updateBarcode(barcode: number) {
		if (barcode <= 0) throw Error(`Expect the barcode to be positive`);
		this._barcode = barcode;
	}

	updateUnit(unit: string) {
		const types = Object.keys(ProductUnit);
		if (!types.includes(unit))
			throw Error(`Expect a valid unit in [${types}], got ${unit}`);

		this._unit = unit as ProductUnit;
	}

	updatePrice(price: number) {
		if (price <= 0) throw Error(`Expect the price to be positive`);
		this._price = price;
	}

	updateName(name: string) {
		this._name = name;
	}

	static rehydrate(raw: ProductRehydrateProps) {
		let entity = new Product();

		entity._id = raw.id;
		entity._name = raw.name;
		entity._price = raw.price;
		entity._unit = raw.unit as ProductUnit;
		entity._barcode = raw.barcode;
		entity._amount = raw.amount;

		return entity;
	}

	sellStock(quantity: number) {
		if (quantity > this._amount)
			throw Error(
				`The bought quantity is exceed the product's quantity ${this._amount}`
			);

		this._amount -= quantity;
	}

	receiveStock(quantity: any) {
		if (quantity <= 0) throw Error(`The received quantity is under 0`);
		this._amount += quantity;
	}

	public get id(): number {
		return this._id;
	}
	public get price(): number {
		return this._price;
	}
	public get amount(): number {
		return this._amount;
	}
	public get name() {
		return this._name;
	}
	public get unit() {
		return this._unit;
	}
	public get barcode() {
		return this._barcode;
	}

	private constructor() {}
}

export interface ProductRehydrateProps {
	id: number;
	name: string;
	unit: string;
	price: number;
	barcode: number;
	amount: number;
}

export enum ProductUnit {
	UNKNOWN = "UNKNOWN",
}
