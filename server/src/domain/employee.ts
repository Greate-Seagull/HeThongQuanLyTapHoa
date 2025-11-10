export class Employee {
	private _id: number;
	private _name: string;
	private _position: EmployeePosition;

	private constructor() {}

	static create(name: string, position: string) {
		let entity = new Employee();

		entity._name = name;
		entity.updatePosition(position);

		return entity;
	}

	updatePosition(position: string) {
		const positions = Object.keys(EmployeePosition);
		if (!positions.includes(position))
			throw Error(
				`Expect a valid position in [${positions}], got ${position}`
			);

		this._position = position as EmployeePosition;
	}

	static rehydrate(input: EmployeeRehydrateProps) {
		let entity = new Employee();

		entity._id = input.id;
		entity._name = input.name;
		entity._position = input.position as EmployeePosition;

		return entity;
	}

	get id() {
		return this._id;
	}
	get name() {
		return this._name;
	}
	get position() {
		return this._position;
	}
}

export interface EmployeeRehydrateProps {
	id: number;
	name: string;
	position: string;
}

export enum EmployeePosition {
	SALES = "SALES",
	INVENTORY = "INVENTORY",
	RECEIVING = "RECEIVING",
}
