export class Account {
	private _id: number;
	private _userId: number;
	private _phoneNumber: string;
	private _passwordHash: string;
	private _salt: string;
	private _loggedAt: Date;

	private constructor() {}

	static create(input: AccountCreateInput): Account {
		let entity = new Account();

		entity._userId = input.userId;
		entity._phoneNumber = input.phoneNumber;
		entity._passwordHash = input.passwordHash;
		entity._salt = input.salt;
		entity._loggedAt = new Date();

		return entity;
	}

	static rehydrate(raw: AccountRehydrateInput): Account {
		let entity = new Account();

		entity._id = raw.id;
		entity._userId = raw.userId;
		entity._phoneNumber = raw.phoneNumber;
		entity._passwordHash = raw.passwordHash;
		entity._salt = raw.salt;
		entity._loggedAt = raw.loggedAt;

		return entity;
	}

	signIn() {
		this._loggedAt = new Date();
	}

	validate(passwordHash: string) {
		return this._passwordHash === passwordHash;
	}

	get id(): number {
		return this._id;
	}

	get userId(): number {
		return this._userId;
	}

	get phoneNumber(): string {
		return this._phoneNumber;
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

export interface AccountCreateInput {
	userId: number;
	phoneNumber: string;
	passwordHash: string;
	salt: string;
}

export interface AccountRehydrateInput {
	id: number;
	userId: number;
	phoneNumber: string;
	passwordHash: string;
	salt: string;
	loggedAt: Date;
}
