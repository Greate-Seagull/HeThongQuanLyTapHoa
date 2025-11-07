import { Prisma, PrismaClient } from "@prisma/client";
import { UserMapper } from "../mappers/user.mapper";
import { User } from "../../domain/user";

export class UserRepository implements UserRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async getById(userId: any) {
		const raw = await this.prisma.user.findUnique({
			where: {
				id: userId,
			},
			select: UserRepository.baseQuery,
		});

		return UserMapper.toDomain(raw);
	}

	async save(transaction: Prisma.TransactionClient, user: User) {
		const raw = await transaction.user.update({
			where: { id: user.id },
			data: UserMapper.toPersistence(user),
			select: UserRepository.baseQuery,
		});

		return UserMapper.toDomain(raw);
	}

	static baseQuery = {
		id: true,
		name: true,
		point: true,
	};
}
