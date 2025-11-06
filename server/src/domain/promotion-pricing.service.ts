import { Promotion } from "./promotion";

export class PromotionPricingService {
	getBestPromotion(
		promotions: Promotion[],
		basePrice: number,
		date: Date = new Date()
	): Promotion | null {
		return promotions
			.filter((p) => p.isActive(date))
			.reduce((best, current) => {
				if (
					!best ||
					best.calculateDiscount(basePrice) <=
						current.calculateDiscount(basePrice)
				)
					return current;
				return best;
			}, null);
	}
}
