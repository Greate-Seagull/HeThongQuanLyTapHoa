import { PrismaClient } from "@prisma/client";
import { Promotion } from "../../domain/entities/promotion";
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
		const data = toPersistenceObject(promotion);
		if (data.promotionDetails) {
			const details = data.promotionDetails;
			delete data.promotionDetails; // Xóa mảng thô để tránh lỗi Prisma
			if (Array.isArray(details) && details.length > 0)
				data.promotionDetails = {
					create: details.map(toPersistenceObject),
				};
		}
		const raw = await this.prisma.promotion.create({
			data: this.tracker.diff(promotion.id, data),
			...PromotionRepository.baseQuery,
		});

		const entity = fromPersistence(Promotion, raw);
		this.tracker.track(entity.id, raw);
		return entity;
	}

	async update(promotion: Promotion): Promise<Promotion> {
		const data = toPersistenceObject(promotion);
		const diff = this.tracker.diff(promotion.id, data);

		   // Xử lý update nested relation: Xóa cũ -> Tạo mới (Full Replacement Strategy)
		   if (diff.promotionDetails) {
			   const details = diff.promotionDetails;
			   delete diff.promotionDetails;
			   if (Array.isArray(details) && details.length > 0) {
				   diff.promotionDetails = {
					   deleteMany: {}, // Xóa tất cả chi tiết cũ của promotion này
					   create: details.map(toPersistenceObject), // Tạo lại danh sách mới
				   };
			   } else {
				   // Nếu mảng rỗng thì chỉ xóa hết
				   diff.promotionDetails = {
					   deleteMany: {}
				   };
			   }
		   }

		const raw = await this.prisma.promotion.update({
			where: { id: promotion.id },
			data: diff,
			...PromotionRepository.baseQuery,
		});

		const entity = fromPersistence(Promotion, raw);
		this.tracker.track(entity.id, raw);
		return entity;
	}

	async delete(id: number): Promise<void> {
		await this.prisma.promotion.delete({
			where: { id },
		});
		// Không cần track nữa vì đã xóa
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

		const entities = [];
		for (const raw of raws) {
			const entity = fromPersistence(Promotion, raw);
			this.tracker.track(entity.id, raw);
			entities.push(entity);
		}
		return entities;
	}

	static baseQuery = buildSafePrismaSelect(Promotion);
}
