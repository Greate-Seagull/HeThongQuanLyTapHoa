import { Read } from "../../types/decorators";

export interface Id {}

export class BaseEntity<IdType extends Id> {
	protected _id: IdType = null;

	public constructor() {}

	// Setters
	protected set id(value: IdType) {
		this._id = value;
	}

	// Getters
	@Read
	public get id(): IdType {
		return this._id;
	}
}
