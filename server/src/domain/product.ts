export class Product {
	private _id?: number;
	private _name!: string;
	private _price!: number;
	private _amount!: number;
	private _unit!: ProductUnit;

	static rehydrate(raw: ProductRehydrateProps) {
		let entity = new Product();

		entity._id = raw.id;
		entity._name = raw.name;
		entity._price = raw.price;
		entity._amount = raw.amount;
		entity._unit = raw.unit as ProductUnit;

		return entity;
	}

	sellStocks(quantity: number) {
		if (quantity > this._amount)
			throw Error(
				`The bought quantity is exceed the product's quantity ${this._amount}`
			);

		this._amount -= quantity;
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

	private constructor() {}
}

export interface ProductRehydrateProps {
	id: number;
	name: string;
	unit: string;
	price: number;
	amount: number;
}

export enum ProductUnit {
	UNKNOWN = "UNKNOWN",
}
