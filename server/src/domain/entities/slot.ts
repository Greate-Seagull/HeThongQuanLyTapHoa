import { Read, Required, Type, Write } from "../../types/decorators";
import { create } from "../services/factory.service";
import { BaseEntity } from "../abstracts/entity";

export type SlotId = number | null;

// ✅ ADD: Define SlotDetail interface (if not already exists)
interface SlotDetail {
	id: number;
	slotId: number;
	productId: number;
}

export class Slot extends BaseEntity<SlotId> {
	protected _id: SlotId = null;
	private _name: string = "";
	private _rackId: number = null;
	private _slotDetails: SlotDetail[] = [];

	static create(input: any) {
		const entity = create(Slot, input);
		if (input.name) entity.name = input.name;
		if (input.rackId) entity.rackId = input.rackId;
		return entity;
	}

	public update(input: any) {
		if (input.name !== undefined) this.name = input.name;
		if (input.rackId !== undefined) this.rackId = input.rackId;
	}

	// Setters
	private set id(value: SlotId) {
		this._id = value;
	}
	private set name(value: string) {
		if (!value || value.length < 1) throw Error("Invalid name");
		this._name = value;
	}
	private set rackId(value: number) {
		this._rackId = value;
	}
	private set slotDetails(value: SlotDetail[]) {
		this._slotDetails = value;
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