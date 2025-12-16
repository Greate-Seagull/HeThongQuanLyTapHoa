import { Read, Required, Type, Write } from "../types/decorators";

export type AccountId = number | null;

export class Account {
	private _id: AccountId = null;
	private _phoneNumber: string = null;
	private _passwordHash: string = null;
	private _salt: string = null;
	private _loggedAt: Date = new Date();
	private _userId: number = null;

	private constructor() {}

	signIn() {
		this.loggedAt = new Date();
	}

	// Setters
	private set id(value: AccountId) {
		if (value < 0) throw Error(`Invalid id, ${value}`);
		this._id = value;
	}
	private set phoneNumber(value: string) {
		this._phoneNumber = value;
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
	private set userId(value: number) {
		if (value < 0) throw Error(`Invalid id, ${value}`);
		this._userId = value;
	}

	// Getters
	@Read
	@Type(Number)
	get id(): AccountId {
		return this._id;
	}
	@Read
	@Write
	@Required
	@Type(String)
	get phoneNumber(): string {
		return this._phoneNumber;
	}
	@Read
	@Write
	@Required
	@Type(String)
	private get passwordHash(): string {
		return this._passwordHash;
	}
	@Write
	@Required
	@Type(String)
	private get salt(): string {
		return this._salt;
	}
	@Read
	@Write
	@Type(Date)
	get loggedAt(): Date {
		return this._loggedAt;
	}
	@Read
	@Write
	@Required
	@Type(String)
	get userId(): number {
		return this._userId;
	}
}
