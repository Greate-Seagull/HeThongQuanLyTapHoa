import { EmployeeAccount } from "../../domain/employee-account";

export class EmployeeAccountMapper {
	static toDomain(raw: any): EmployeeAccount {
		return EmployeeAccount.rehydrate(raw);
	}

	static toPersistence(entity: EmployeeAccount) {
		return {
			employeeId: entity.employeeId,
			username: entity.username,
			passwordHash: entity.passwordHash,
			salt: entity.salt,
			loggedAt: entity.loggedAt,
		};
	}
}
