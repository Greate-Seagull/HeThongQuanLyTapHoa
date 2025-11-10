import { Account } from "../../domain/account";

export class AccountMapper {
	static toDomain(raw: any) {
		return Account.rehydrate(raw);
	}

	static toPersistence(entity: Account) {
		return {
			userId: entity.userId,
			phoneNumber: entity.phoneNumber,
			passwordHash: entity.passwordHash,
			salt: entity.salt,
			loggedAt: entity.loggedAt,
		};
	}
}
