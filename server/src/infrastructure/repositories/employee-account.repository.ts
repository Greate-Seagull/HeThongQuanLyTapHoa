import { Prisma, PrismaClient } from "@prisma/client";
import { EmployeeAccountMapper } from "../mappers/employee-account.mapper";
import { EmployeeAccount } from "../../domain/employee-account";

export class EmployeeAccountRepository implements EmployeeAccountRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async add(transaction: Prisma.TransactionClient, account: EmployeeAccount) {
		const raw = await transaction.employeeAccount.create({
			data: EmployeeAccountMapper.toPersistence(account),
			select: EmployeeAccountRepository.baseQuery,
		});

		return EmployeeAccountMapper.toDomain(raw);
	}

	async getByUsername(username: string) {
		const raw = await this.prisma.employeeAccount.findUnique({
			where: {
				username,
			},
			select: EmployeeAccountRepository.baseQuery,
		});

		return EmployeeAccountMapper.toDomain(raw);
	}

	async save(
		transaction: Prisma.TransactionClient,
		account: EmployeeAccount
	) {
		const repo = transaction ? transaction : this.prisma;
		const raw = await repo.employeeAccount.update({
			where: { id: account.id },
			data: EmployeeAccountMapper.toPersistence(account),
			select: EmployeeAccountRepository.baseQuery,
		});

		return EmployeeAccountMapper.toDomain(raw);
	}

	static baseQuery = {
		id: true,
		employeeId: true,
		username: true,
		passwordHash: true,
		salt: true,
		loggedAt: true,
	};
}
