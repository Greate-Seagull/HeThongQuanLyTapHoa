import { PromotionPricingService } from "../../../domain/services/promotion-pricing.service";
import z from "zod";
import { logger } from "../../../domain/services/logger.service";
import { PromotionRepository } from "../../repositories/promotion.repository";
import { ProductReadAccessor } from "../read-accessors/product.read-accessor";

export class SearchProductsUsecaseInput {
	constructor(public productId: number) {}
}

const inputSchema = z.object({
	productId: z.number(),
});

const output = z.object({
	product: z.object({
		id: z.number(),
		name: z.string(),
		price: z.number(),
		unit: z.string(),
	}),
	promotion: z
		.object({
			id: z.number(),
			name: z.string(),
			value: z.number(),
			type: z.string(),
		})
		.optional()
		.nullable(),
});

export class SearchProductsUsecase {
	constructor(
		private readonly productRead: ProductReadAccessor,
		private readonly promotionRepo: PromotionRepository,
		private readonly promotionPricing: PromotionPricingService
	) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Retrieving product by product id",
			productId: parsedInput.productId,
		});
		log.info("Task started");

		const product = await this.productRead.getProductIncludePromotionId(
			parsedInput.productId
		);
		if (!product) {
			log.warn(`Task failed: invalid product id`);
			throw Error(`Invalid product id, ${parsedInput.productId}`);
		}

		const promotionIds = product.promotionDetails.map(
			(p: any) => p.promotionId
		);
		const promotions = await this.promotionRepo.getByIds(promotionIds);
		log.debug("Task loaded", {
			productId: product.id,
			promotionIds: promotions.map((p) => p.id),
		});

		const bestPromotion = this.promotionPricing.getBestPromotion(
			promotions,
			product.price
		);
		log.debug("Task computed", {
			promotionId: bestPromotion ? bestPromotion.id : null,
		});

		log.info("Task completed");
		return output.parse({
			product: {
				id: product.id,
				name: product.name,
				price: product.price,
				unit: product.unit,
			},
			promotion: bestPromotion
				? {
						id: bestPromotion.id,
						name: bestPromotion.name,
						value: bestPromotion.value,
						type: bestPromotion.promotionType,
				  }
				: null,
		});
	}
}
