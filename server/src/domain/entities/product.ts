import { Read, Required, Relation, Write } from "../../types/decorators";
import { BaseEntity } from "../abstracts/entity";

export type ProductId = number | null;
export type ProductBarcode = number | null;

export enum ProductUnit {
	PIECE = "PIECE", // Cái, chiếc (xà phòng, kem đánh răng, v.v.)
	BOX = "BOX", // Hộp (sữa hộp, snack hộp)
	BOTTLE = "BOTTLE", // Chai (nước ngọt, dầu gội, nước suối)
	CAN = "CAN", // Lon (bia, nước ngọt lon)
	PACKAGE = "PACKAGE", // Gói (mì gói, snack gói)
	BAG = "BAG", // Túi, bao (gạo, đường)
	KG = "KG", // Kilogram (trái cây, thịt, cá)
	GRAM = "GRAM", // Gram (gia vị, bánh kẹo lẻ)
	LITER = "LITER", // Lít (dầu ăn, nước mắm)
	ML = "ML", // Milliliter (sữa chua uống nhỏ)
}

export class Product extends BaseEntity<ProductId> {
	private _name: string = null;
	private _price: number = 0;
	private _unit: ProductUnit = ProductUnit.PIECE;
	private _barcode: number = null;
	private _amount: number = 0;

	public static create(
		name: string,
		price: number,
		unit: string,
		barcode: number
	) {
		let entity = new Product();
		entity.updateName(name);
		entity.updatePrice(price);
		entity.updateUnit(unit);
		entity.updateBarcode(barcode);
		entity.amount = 0;
		return entity;
	}

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
	private set price(value: number) {
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
		const types = Object.values(ProductUnit);
		if (!types.includes(value)) throw Error(`Invalid unit, ${value}`);

		this._unit = value;
	}
	private set barcode(value: number) {
		if (value <= 0) throw Error(`Invalid barcode, ${value}`);
		this._barcode = value;
	}

	// Getters
	@Read
	@Write
	public get price(): number {
		return this._price;
	}
	@Read
	@Write
	public get amount(): number {
		return this._amount;
	}
	@Read
	@Write
	public get name(): string {
		return this._name;
	}
	@Read
	@Write
	public get unit(): ProductUnit {
		return this._unit;
	}
	@Read
	@Write
	public get barcode(): number {
		return this._barcode;
	}
}

export enum ProductStatus {
	GOOD = "GOOD",
	EXPIRED = "EXPIRED",
}
