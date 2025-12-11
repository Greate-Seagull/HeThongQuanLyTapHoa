import { Prisma, PrismaClient } from "@prisma/client";
import { Stocktaking } from "../../domain/stocktaking";
import { ChangeTracker } from "../cache/change-tracker";
import {
	fromPersistence,
	toPersistenceObject,
} from "../../domain/services/mapper.service";
import { buildSafePrismaSelect } from "../../domain/services/query-builder.service";

export class StocktakingRepository implements StocktakingRepository {
	private tracker = new ChangeTracker<any>();

	constructor(private readonly prisma: PrismaClient) {}

	async add(transaction: Prisma.TransactionClient, entity: Stocktaking) {
		const repo = transaction ? transaction : this.prisma;
		let data = toPersistenceObject(entity);
		data.stocktakingDetails = {
			create: entity.stocktakingDetails.map(toPersistenceObject),
		};
		const raw = await repo.stocktaking.create({
			data: this.tracker.diff(entity.id, data),
			...StocktakingRepository.baseQuery,
		});

		let savedEntity = fromPersistence(Stocktaking, raw);
		this.tracker.track(savedEntity.id, raw);
		return savedEntity;
	}

	static baseQuery = buildSafePrismaSelect(Stocktaking);
}
