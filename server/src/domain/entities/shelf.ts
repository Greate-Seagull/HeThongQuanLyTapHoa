import { Read, Required, Type, Write } from "../../types/decorators";
import { create } from "../services/factory.service";
import { BaseEntity } from "../abstracts/entity";

export type ShelfId = number | null;

export class Shelf extends BaseEntity<ShelfId> {
	protected _id: ShelfId = null;
	private _name: string = null;


	static create(input: any) {
		const entity = create(Shelf, input);
		if (input.name) entity.name = input.name;
		return entity;
	}

	public update(input: any) {
		if (input.name !== undefined) this.name = input.name;
	}

	// Setters
	private set id(value: ShelfId) {
		this._id = value;
	}

	private set name(value: string) {
		if (!value || value.length === 0) throw Error("Name cannot be empty");
		this._name = value;
	}

	// Getters
	@Read
	@Type(Number)
	public get id(): ShelfId {
		return this._id;
	}

	@Read
	@Write
	@Required
	@Type(String)
	public get name(): string {
		return this._name;
	}
}