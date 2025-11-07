export class Employee {
	private _id: number;
	private _name: string;

	private constructor() {}

	static rehydrate(input: EmployeeRehydrateProps) {
		let entity = new Employee();

		entity._id = input.id;
		entity._name = input.name;

		return entity;
	}

	get id() {
		return this._id;
	}
	get name() {
		return this._name;
	}
}

export interface EmployeeRehydrateProps {
	id: number;
	name: string;
}
