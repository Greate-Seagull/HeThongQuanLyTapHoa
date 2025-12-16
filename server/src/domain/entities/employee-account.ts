import { Read, Write } from "../../types/decorators";
import { BaseEntity } from "../abstracts/entity";
import { EmployeeId } from "./employee";

export type EmployeeAccountId = number | null;

export class EmployeeAccount extends BaseEntity<EmployeeAccountId> {
	private _employeeId: number = null;
	private _username: string = null;
	private _passwordHash: string = null;
	private _salt: string = null;
	private _loggedAt: Date = new Date();

	public static create(
		username: string,
		passwordHash: string,
		salt: string,
		employeeId: EmployeeId
	) {
		const account = new EmployeeAccount();
		account.username = username;
		account.passwordHash = passwordHash;
		account.salt = salt;
		account.employeeId = employeeId;
		account.signIn();
		return account;
	}

	signIn() {
		this._loggedAt = new Date();
	}

	updateUsername(username: string) {
		this.username = username;
	}

	// Setters
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
	@Write
	get employeeId(): EmployeeId {
		return this._employeeId;
	}
	@Read
	@Write
	get username(): string {
		return this._username;
	}
	@Read
	@Write
	get passwordHash(): string {
		return this._passwordHash;
	}
	@Write
	get salt(): string {
		return this._salt;
	}
	@Read
	@Write
	get loggedAt(): Date {
		return this._loggedAt;
	}
}
