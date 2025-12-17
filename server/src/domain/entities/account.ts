import { Read, Required, Relation, Write } from "../../types/decorators";
import { BaseEntity } from "../abstracts/entity";
import { UserId } from "./user";

export type AccountId = number | null;

export class Account extends BaseEntity<AccountId> {
	private _phoneNumber: string = null;
	private _passwordHash: string = null;
	private _salt: string = null;
	private _loggedAt: Date = new Date();
	private _userId: UserId = null;

	static create(
		phoneNumber: string,
		passwordHash: string,
		salt: string,
		userId: UserId
	) {
		let entity = new Account();
		entity.phoneNumber = phoneNumber;
		entity.passwordHash = passwordHash;
		entity.salt = salt;
		entity.userId = userId;
		entity.signIn();
		return entity;
	}

	public signIn() {
		this.loggedAt = new Date();
	}

	// Setters
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
	private set userId(value: UserId) {
		if (value < 0) throw Error(`Invalid id, ${value}`);
		this._userId = value;
	}

	// Getters
	@Read
	@Write
	public get phoneNumber(): string {
		return this._phoneNumber;
	}
	@Read
	@Write
	public get passwordHash(): string {
		return this._passwordHash;
	}
	@Read
	@Write
	public get salt(): string {
		return this._salt;
	}
	@Read
	@Write
	public get loggedAt(): Date {
		return this._loggedAt;
	}
	@Read
	@Write
	public get userId(): UserId {
		return this._userId;
	}
}
