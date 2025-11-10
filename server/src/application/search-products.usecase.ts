import { Product } from "src/domain/product";
import { ProductReadAccessor } from "src/infrastructure/read-accessors/product.read-accessor";
import { PromotionType } from "../domain/promotion";
import { PromotionRepository } from "../infrastructure/repositories/promotion.repository";
import { PromotionPricingService } from "../domain/services/promotion-pricing.service";

export class SearchProductsUsecaseInput {
	constructor(public productId: number) {}
}

export type ProductOutput = {
	id: number;
	name: string;
	price: number;
	unit: string;
};
export type PromotionOutput = {
	id: number;
	name: string;
	value: number;
	type: string;
};
export class SearchProductsUsecaseOutput {
	constructor(
		public product: ProductOutput,
		public promotion: PromotionOutput
	) {}
}

export class SearchProductsUsecase {
	constructor(
		private readonly productRead: ProductReadAccessor,
		private readonly promotionRepo: PromotionRepository,
		private readonly promotionPricing: PromotionPricingService
	) {}

	async execute(
		input: SearchProductsUsecaseInput
	): Promise<SearchProductsUsecaseOutput> {
		const product = await this.productRead.getProductIncludePromotionId(
			input.productId
		);
		if (!product) throw Error(`Product not found. ${input.productId}`);

		const promotions = await this.promotionRepo.getByIds(
			product.promotionDetails.map((p: any) => p.promotionId)
		);

		const bestPromotion = this.promotionPricing.getBestPromotion(
			promotions,
			product.price
		);

		const productOutput: ProductOutput = {
			id: product.id,
			name: product.name,
			price: product.price,
			unit: product.unit,
		};

		const promotionOutput: PromotionOutput = bestPromotion
			? {
					id: bestPromotion.id,
					name: bestPromotion.name,
					value: bestPromotion.value,
					type: bestPromotion.promotionType,
			  }
			: null;

		return new SearchProductsUsecaseOutput(productOutput, promotionOutput);
	}
}
