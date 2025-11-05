import { PromotionRepository } from "src/infrastructure/repositories/promotion.repository";

export class CreatePromotionUsecaseInput {
	constructor(
		public name: String,
		public description: String,
		public startedAt: Date,
		public endedAt: Date,
		public condition: String,
		public value: Number,
		public promotionId: Number,
		public products: [Number]
	) {}
}

export class CreatePromotionUsecaseOutput {
	constructor(public promotionId: Number) {}
}

export class CreatePromotionUsecase {
	constructor(private readonly promotionRepo: PromotionRepository) {}

	async execute(
		input: CreatePromotionUsecaseInput
	): Promise<CreatePromotionUsecaseOutput> {
		return null;
	}
}
