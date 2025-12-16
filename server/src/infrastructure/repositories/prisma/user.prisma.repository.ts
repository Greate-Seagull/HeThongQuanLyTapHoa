import { UserDto } from "../../../application/DTOs/user.dto";
import { buildSafePrismaSelect } from "../../../domain/services/query-builder.service";
import { User } from "../../../domain/entities/user";
import { UserRepository } from "../../../application/repositories/user.repository";
import { PrismaRepository } from "./prisma.prisma.repository";
import { Prisma } from "../../../generated/client";

export class UserPrismaRepository
	extends PrismaRepository<User, UserDto>
	implements UserRepository
{
	private static baseSelect = buildSafePrismaSelect(User);

	protected buildUpdateData(entity: User): Partial<UserDto> {
		return this.toPersistence(entity);
	}

	protected buildCreateData(entity: User): Partial<UserDto> {
		return this.toPersistence(entity);
	}

	protected getBaseQuery(): { select: object } {
		return UserPrismaRepository.baseSelect;
	}

	protected getRepository(transaction?: Prisma.TransactionClient): any {
		if (transaction) return transaction.user;
		return this.client.user;
	}
}
