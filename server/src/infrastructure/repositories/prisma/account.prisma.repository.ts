import { Prisma } from "../../../generated/client";
import { Account } from "../../../domain/entities/account";
import { buildSafePrismaSelect } from "../../../domain/services/query-builder.service";
import { PrismaRepository } from "./prisma.prisma.repository";
import { AccountDto } from "../../../application/DTOs/account.dto";
import { AccountRepository } from "../../../application/repositories/account.repository";

export class AccountPrismaRepository
	extends PrismaRepository<Account, AccountDto>
	implements AccountRepository
{
	private static baseSelect = buildSafePrismaSelect(Account);

	async getByPhoneNumber(phoneNumber: string) {
		const raw = await this.getRepository().findUnique({
			where: {
				phoneNumber,
			},
			select: this.getBaseQuery().select,
		});

		return this.fromPersistence(raw);
	}

	protected buildUpdateData(entity: Account): Partial<AccountDto> {
		return this.toPersistence(entity);
	}

	protected buildCreateData(entity: Account): Partial<AccountDto> {
		return this.toPersistence(entity);
	}

	protected getBaseQuery(): { select: object } {
		return AccountPrismaRepository.baseSelect;
	}

	protected getRepository(transaction?: Prisma.TransactionClient): any {
		if (transaction) return transaction.account;
		return this.client.account;
	}
}
