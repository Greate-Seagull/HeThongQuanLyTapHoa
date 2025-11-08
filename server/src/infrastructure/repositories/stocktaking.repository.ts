import { Prisma, PrismaClient } from "@prisma/client";
import { Stocktaking } from "../../domain/stocktaking";
import { StocktakingMapper } from "../mappers/stocktaking.mapper";

export class StocktakingRepository implements StocktakingRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async add(transaction: Prisma.TransactionClient, entity: Stocktaking) {
		const repo = transaction ? transaction : this.prisma;
		const raw = await repo.stocktaking.create({
			data: StocktakingMapper.toPersistence(entity),
			select: StocktakingRepository.baseQuery,
		});

		return StocktakingMapper.toDomain(raw);
	}

	static baseQuery = {
		id: true,
		employeeId: true,
		createdAt: true,
		stocktakingDetails: true,
	};
}
