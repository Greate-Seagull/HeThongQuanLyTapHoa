import { Read, Required, Type, Write } from "../types/decorators";
import { create } from "./services/factory.service";

export type SlotId = number | null;

export class Slot {
	private _id: SlotId = null;
	private _name: string = null;
	private _rackId: number = null;

	private constructor() {}

	static create(input: any) {
		const entity = create(Slot, input);
		if (input.name) entity.name = input.name;
		if (input.rackId) entity.rackId = input.rackId;
		return entity;
	}

	public update(input: any) {
		if (input.name !== undefined) this.name = input.name;
	}

	// Setters
	private set id(value: SlotId) {
		this._id = value;
	}
	private set name(value: string) {
		if (!value || value.length === 0) throw Error("Name cannot be empty");
		this._name = value;
	}
	private set rackId(value: number) {
		this._rackId = value;
	}

	// Getters
	@Read
	@Type(Number)
	public get id(): SlotId {
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
	public get rackId(): number {
		return this._rackId;
	}
}