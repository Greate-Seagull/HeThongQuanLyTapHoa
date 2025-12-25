import { BaseEntity } from "../abstracts/entity";
import { Optional, Read, Required, Type, Write } from "../../types/decorators";
import { create } from "../services/factory.service";

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
    // Trả về số lượng đã bán (stub, cần thay bằng truy vấn thực tế)
    public async getSoldQuantity(): Promise<number> {
      // TODO: Thay bằng truy vấn thực tế từ DB hoặc service
      return 0;
    }
  protected _id: ProductId = null;
  private _name: string = null;
  private _price: number = 0;
  private _unit: ProductUnit = ProductUnit.PIECE;
  private _barcode: number = null;
  private _amount: number = 0;
  private _categoryId: number = null;
  private _supplierId: number = null;


  static create(input: any) {
    const entity = create(Product, input);
    if (input.amount !== undefined) entity.amount = input.amount;
    if (input.barcode) entity.barcode = input.barcode;
    if (input.categoryId) entity.categoryId = input.categoryId;
    if (input.supplierId) entity.supplierId = input.supplierId;
    return entity;
  }

  public update(input: any) {
    if (input.name !== undefined) this.name = input.name;
    if (input.price !== undefined) this.price = input.price;
    if (input.amount !== undefined) this.amount = input.amount;
    if (input.unit !== undefined) this.unit = input.unit;
    if (input.barcode !== undefined) this.barcode = input.barcode;
    if (input.categoryId !== undefined) this.categoryId = input.categoryId;
    if (input.supplierId !== undefined) this.supplierId = input.supplierId;
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
    if (quantity <= 0) throw Error(`Invalid received quantity, ${quantity}`);
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

    this._unit = value as ProductUnit;
  }
  private set barcode(value: number) {
    if (value <= 0) throw Error(`Invalid barcode, ${value}`);
    this._barcode = value;
  }
  private set categoryId(value: number) {
    this._categoryId = value;
  }
  private set supplierId(value: number) {
    this._supplierId = value;
  }

  // Getters
  @Read
  @Write
  @Required
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
  @Read
  @Write
  @Optional
  @Type(Number)
  public get categoryId(): number {
    return this._categoryId;
  }
  @Read
  @Write
  @Optional
  @Type(Number)
  public get supplierId(): number {
    return this._supplierId;
  }
}

export enum ProductStatus {
  GOOD = "GOOD",
  EXPIRED = "EXPIRED",
}
