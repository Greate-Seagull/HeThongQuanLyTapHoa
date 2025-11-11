import { GoodReceipt, GoodReceiptDetail } from "../../domain/good-receipt";

export class GoodReceiptMapper {
	static toDomain(raw: any) {
		return GoodReceipt.rehydrate(raw);
	}

	static toPersistence(entity: GoodReceipt) {
		return {
			employeeId: entity.employeeId,
			createdAt: entity.createdAt,
			goodReceiptDetails: {
				create: entity.goodReceiptDetails.map(
					GoodReceiptDetailMapper.toPersistence
				),
			},
		};
	}
}

class GoodReceiptDetailMapper {
	static toPersistence(e: GoodReceiptDetail) {
		return {
			productId: e.productId,
			quantity: e.quantity,
			price: e.price,
		};
	}
}
