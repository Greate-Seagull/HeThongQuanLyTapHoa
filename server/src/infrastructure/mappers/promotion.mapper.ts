import { Promotion, PromotionDetail } from "../../domain/promotion";

export class PromotionMapper {
	static toDomain(raw: any) {
		return Promotion.rehydrate(raw);
	}

	static toPersistence(entity: Promotion) {
		return {
			name: entity.name,
			description: entity.description,
			startedAt: entity.startedAt,
			endedAt: entity.endedAt,
			condition: entity.condition,
			value: entity.value,
			promotionType: entity.promotionType,
			promotionDetails: {
				create: entity.promotionDetails.map((pD: PromotionDetail) => ({
					productId: pD.productId,
				})),
			},
		};
	}
}
