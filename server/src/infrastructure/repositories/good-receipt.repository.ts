import { Prisma, PrismaClient } from "@prisma/client";
import { GoodReceipt } from "../../domain/good-receipt";
import {
	fromPersistence,
	toPersistenceObject,
} from "../../domain/services/mapper.service";
import { buildSafePrismaSelect } from "../../domain/services/query-builder.service";
import { ChangeTracker } from "../cache/change-tracker";

export class GoodReceiptRepository implements GoodReceiptRepository {
	private tracker = new ChangeTracker<any>();

	constructor(private readonly prisma: PrismaClient) {}

	async add(transaction: Prisma.TransactionClient, entity: GoodReceipt) {
		const repo = transaction ? transaction : this.prisma;
		let data = toPersistenceObject(entity);
		data.goodReceiptDetails = {
			create: entity.goodReceiptDetails.map(toPersistenceObject),
		};
		const raw = await repo.GoodReceipt.create({
			data,
			...GoodReceiptRepository.baseQuery,
		});

		let savedEntity = fromPersistence(GoodReceipt, raw);
		this.tracker.track(savedEntity.id, raw);
		return savedEntity;
	}

	static baseQuery = buildSafePrismaSelect(GoodReceipt);
}
