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

	static baseQuery = {
		id: true,
		userId: true,
		phoneNumber: true,
		passwordHash: true,
		loggedAt: true,
	};
}
