import { Read, Write } from "../../types/decorators";
import { BaseEntity } from "../abstracts/entity";

export enum EmployeePosition {
	SALES = "SALES",
	INVENTORY = "INVENTORY",
	RECEIVING = "RECEIVING",
	MANAGER = "MANAGER",
}

export type EmployeeId = number | null;

export class Employee extends BaseEntity<EmployeeId> {
	private _name: string = null;
	private _position: EmployeePosition = EmployeePosition.SALES;
	private _avatar: string | null = null;

	static create(name: string, position: string) {
		const employee = new Employee();
		employee.name = name;
		employee.position = position as EmployeePosition;
		return employee;
	}

	update(name?: string, position?: string, avatar?: string) {
		if (name !== undefined) this.name = name;
		if (position !== undefined) this.position = position as EmployeePosition;
		if (avatar !== undefined) this.avatar = avatar;
	}

	// Setters
	private set name(value: string) {
		this._name = value;
	}
	private set position(value: EmployeePosition) {
		const positions = Object.keys(EmployeePosition);
		if (!positions.includes(value))
			throw Error(`Invalid position, ${value}`);
		this._position = value;
	}
	private set avatar(value: string | null) {
		this._avatar = value;
	}

	// Getters
	@Read
	@Write
	get name() {
		return this._name;
	}
	@Read
	@Write
	get position() {
		return this._position;
	}
	@Read
	@Write
	get avatar() {
		return this._avatar;
	}
}
