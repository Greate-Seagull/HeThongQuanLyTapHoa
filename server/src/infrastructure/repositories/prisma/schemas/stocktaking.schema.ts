import { Stocktaking, StocktakingDetail } from "../../../../domain/entities/stocktaking";

export const stocktakingSchema = {
	model: "stocktaking",
	select: {
		id: true,
		employeeId: true,
		createdAt: true,
		stocktakingDetails: {
			select: {
				id: true,
				productId: true,
				slotId: true,
				status: true,
				quantity: true,
			},
		},
	},
	include: {
		stocktakingDetails: true,
	},
	transform: (data: any) => {
		const stocktaking = new Stocktaking();
		(stocktaking as any).id = data.id;
		(stocktaking as any)._employeeId = data.employeeId;
		(stocktaking as any)._createdAt = data.createdAt;
		
		if (data.stocktakingDetails) {
			const details = data.stocktakingDetails.map((detail: any) => {
				const stocktakingDetail = new StocktakingDetail();
				(stocktakingDetail as any).id = detail.id;
				(stocktakingDetail as any)._productId = detail.productId;
				(stocktakingDetail as any)._slotId = detail.slotId;
				(stocktakingDetail as any)._status = detail.status;
				(stocktakingDetail as any)._quantity = detail.quantity;
				return stocktakingDetail;
			});
			(stocktaking as any)._stocktakingDetails = details;
		}
		
		return stocktaking;
	},
};
