export class Product {
	private _id?: number;
	private _money?: number;
	private _amount?: number;

	public get id(): number {
		return this._id;
	}
	public set id(value: number) {
		this._id = value;
	}
	public get money(): number {
		return this._money;
	}
	public set money(value: number) {
		this._money = value;
	}
	public get amount(): number {
		return this._amount;
	}
	public set amount(value: number) {
		this._amount = value;
	}

	constructor() {
		console.log("Enter product constructor");
	}
}
