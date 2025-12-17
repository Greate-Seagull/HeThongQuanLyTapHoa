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

	static create(name: string, position: string) {
		const employee = new Employee();
		employee.name = name;
		employee.position = position as EmployeePosition;
		return employee;
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
}
