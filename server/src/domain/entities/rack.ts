import { Read, Required, Type, Write } from "../../types/decorators";
import { create } from "../services/factory.service";
import { BaseEntity } from "../abstracts/entity";
import { Slot } from "./slot";  // ✅ ADD: Import Slot

export type RackId = number | null;

export class Rack extends BaseEntity<RackId> {
	protected _id: RackId = null;
	private _name: string = "";
	private _shelfId: number = null;
	private _slots: Slot[] = [];

	static create(input: any) {
		const entity = create(Rack, input);
		if (input.name) entity.name = input.name;
		if (input.shelfId) entity.shelfId = input.shelfId;
		return entity;
	}

	public update(input: any) {
		if (input.name !== undefined) this.name = input.name;
		if (input.shelfId !== undefined) this.shelfId = input.shelfId;
	}

	// Setters
	private set id(value: RackId) {
		this._id = value;
	}
	private set name(value: string) {
		if (!value || value.length < 1) throw Error("Invalid name");
		this._name = value;
	}
	private set shelfId(value: number) {
		this._shelfId = value;
	}
	private set slots(value: Slot[]) {
		this._slots = value;
	}

	// Getters
	@Read
	@Type(Number)
	public get id(): RackId {
		return this._id;
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
	@Type(Number)
	public get shelfId(): number {
		return this._shelfId;
	}
}