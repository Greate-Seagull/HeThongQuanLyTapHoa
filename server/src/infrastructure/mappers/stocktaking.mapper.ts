import { Stocktaking, StocktakingDetail } from "../../domain/stocktaking";

export class StocktakingMapper {
	static toDomain(raw: any) {
		return Stocktaking.rehydrate(raw);
	}

	static toPersistence(entity: Stocktaking) {
		return {
			employeeId: entity.employeeId,
			createdAt: entity.createdAt,
			stocktakingDetails: {
				create: entity.stocktakingDetails.map(
					StocktakingDetailMapper.toPersistence
				),
			},
		};
	}
}

class StocktakingDetailMapper {
	static toPersistence(e: StocktakingDetail) {
		return {
			productId: e.productId,
			slotId: e.slotId,
			status: e.status,
			quantity: e.quantity,
		};
	}
}
