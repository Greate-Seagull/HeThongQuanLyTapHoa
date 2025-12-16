import { Read, Required, Type, Write } from "../types/decorators";

export enum EmployeePosition {
	SALES = "SALES",
	INVENTORY = "INVENTORY",
	RECEIVING = "RECEIVING",
	MANAGER = "MANAGER",
}

export type EmployeeId = number | null;

export class Employee {
	private _id: EmployeeId = null;
	private _name: string = null;
	private _position: EmployeePosition = EmployeePosition.SALES;

	private constructor() {}

	// Setters
	private set id(value: EmployeeId) {
		if (value < 0) throw Error(`Invalid id, ${value}`);
		this._id = value;
	}
	private set name(value: string) {
		this._name = value;
	}
	private set position(value: EmployeePosition) {
		const positions = Object.keys(EmployeePosition);
		if (!positions.includes(value))
			throw Error(`Invalid position, ${value}`);
		this._position = value;
	}

	// Getters
	@Read
	@Type(Number)
	get id(): EmployeeId {
		return this._id;
	}
	@Read
	@Write
	@Required
	@Type(String)
	get name() {
		return this._name;
	}
	@Read
	@Write
	@Required
	@Type(EmployeePosition)
	get position() {
		return this._position;
	}
}
