import { Read, Required, Type, Write } from "../types/decorators";

export type EmployeeAccountId = number | null;

export class EmployeeAccount {
	private _id: EmployeeAccountId = null;
	private _employeeId: number = null;
	private _username: string = null;
	private _passwordHash: string = null;
	private _salt: string = null;
	private _loggedAt: Date = new Date();

	private constructor() {}

	signIn() {
		this._loggedAt = new Date();
	}

	// Setters
	private set id(value: EmployeeAccountId) {
		if (value < 0) throw Error(`Invalid id, ${value}`);
		this._id = value;
	}
	private set username(value: string) {
		this._username = value;
	}
	private set passwordHash(value: string) {
		this._passwordHash = value;
	}
	private set salt(value: string) {
		this._salt = value;
	}
	private set loggedAt(value: Date) {
		this._loggedAt = value;
	}
	private set employeeId(value: number) {
		if (value < 0) throw Error(`Invalid id, ${value}`);
		this._employeeId = value;
	}

	// Getters
	@Read
	@Type(Number)
	get id(): EmployeeAccountId {
		return this._id;
	}
	@Read
	@Write
	@Required
	@Type(Number)
	get employeeId(): number {
		return this._employeeId;
	}
	@Read
	@Write
	@Required
	@Type(String)
	get username(): string {
		return this._username;
	}
	@Read
	@Write
	@Required
	@Type(String)
	get passwordHash(): string {
		return this._passwordHash;
	}
	@Write
	@Required
	@Type(String)
	get salt(): string {
		return this._salt;
	}
	@Read
	@Write
	@Type(Date)
	get loggedAt(): Date {
		return this._loggedAt;
	}
}
