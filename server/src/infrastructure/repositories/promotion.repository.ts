import { PrismaClient } from "@prisma/client";
import { Promotion } from "../../domain/promotion";
import { ChangeTracker } from "../cache/change-tracker";
import {
	fromPersistence,
	toPersistenceObject,
} from "../../domain/services/mapper.service";
import { buildSafePrismaSelect } from "../../domain/services/query-builder.service";

export class PromotionRepository implements PromotionRepository {
	private tracker = new ChangeTracker<any>();

	constructor(private readonly prisma: PrismaClient) {}

	async add(promotion: Promotion): Promise<Promotion> {
		let data = toPersistenceObject(promotion);
		data.promotionDetails = {
			create: promotion.promotionDetails.map(toPersistenceObject),
		};
		const raw = await this.prisma.promotion.create({
			data: this.tracker.diff(promotion.id, data),
			...PromotionRepository.baseQuery,
		});

		let entity = fromPersistence(Promotion, raw);
		this.tracker.track(entity.id, raw);
		return entity;
	}

	async getByIds(ids: any[]) {
		const raws = await this.prisma.promotion.findMany({
			where: {
				id: {
					in: ids,
				},
			},
			...PromotionRepository.baseQuery,
		});

		let entities = [];
		for (const raw of raws) {
			let entity = fromPersistence(Promotion, raw);
			this.tracker.track(entity.id, raw);
			entities.push(entity);
		}
		return entities;
	}

	static baseQuery = buildSafePrismaSelect(Promotion);
}
