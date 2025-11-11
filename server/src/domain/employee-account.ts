export class EmployeeAccount {
	private _id: number;
	private _employeeId: number;
	private _username: string;
	private _passwordHash: string;
	private _salt: string;
	private _loggedAt: Date;

	private constructor() {}

	static create(input: EmployeeAccountCreateInput): EmployeeAccount {
		let entity = new EmployeeAccount();

		entity._employeeId = input.employeeId;
		entity._username = input.username;
		entity._passwordHash = input.passwordHash;
		entity._salt = input.salt;
		entity._loggedAt = new Date();

		return entity;
	}

	static rehydrate(raw: EmployeeAccountRehydrateInput): EmployeeAccount {
		let entity = new EmployeeAccount();

		entity._id = raw.id;
		entity._employeeId = raw.employeeId;
		entity._username = raw.username;
		entity._passwordHash = raw.passwordHash;
		entity._salt = raw.salt;
		entity._loggedAt = raw.loggedAt;

		return entity;
	}

	validate(passwordHash: string) {
		return this._passwordHash === passwordHash;
	}

	signIn() {
		this._loggedAt = new Date();
	}

	get id(): number {
		return this._id;
	}

	get employeeId(): number {
		return this._employeeId;
	}

	get username(): string {
		return this._username;
	}

	get passwordHash(): string {
		return this._passwordHash;
	}

	get salt(): string {
		return this._salt;
	}

	get loggedAt(): Date {
		return this._loggedAt;
	}
}

export interface EmployeeAccountCreateInput {
	employeeId: number;
	username: string;
	passwordHash: string;
	salt: string;
}

export interface EmployeeAccountRehydrateInput {
	id: number;
	employeeId: number;
	username: string;
	passwordHash: string;
	salt: string;
	loggedAt: Date;
}
