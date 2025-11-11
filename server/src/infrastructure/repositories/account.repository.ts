import { Prisma, PrismaClient } from "@prisma/client";
import { AccountMapper } from "../mappers/account.mapper";
import { Account } from "../../domain/account";

export class AccountRepository implements AccountRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async add(transaction: Prisma.TransactionClient, account: Account) {
		const raw = await transaction.account.create({
			data: AccountMapper.toPersistence(account),
			select: AccountRepository.baseQuery,
		});

		return AccountMapper.toDomain(raw);
	}

	async getByPhoneNumber(phoneNumber: string) {
		const raw = await this.prisma.account.findUnique({
			where: {
				phoneNumber: phoneNumber,
			},
			select: AccountRepository.baseQuery,
		});

		return AccountMapper.toDomain(raw);
	}

	async save(transaction: Prisma.TransactionClient, account: Account) {
		const repo = transaction ? transaction : this.prisma;
		const raw = await repo.account.update({
			where: { id: account.id },
			data: AccountMapper.toPersistence(account),
			select: AccountRepository.baseQuery,
		});

		return AccountMapper.toDomain(raw);
	}

	static baseQuery = {
		id: true,
		userId: true,
		phoneNumber: true,
		passwordHash: true,
		salt: true,
		loggedAt: true,
	};
}
