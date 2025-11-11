import { Promotion, PromotionCreateProps } from "../domain/promotion";
import { ProductReadAccessor } from "../infrastructure/read-accessors/product.read-accessor";
import { PromotionRepository } from "../infrastructure/repositories/promotion.repository";

export class CreatePromotionUsecaseInput {
	constructor(
		public name: string,
		public description: string,
		public startedAt: Date,
		public endedAt: Date,
		public condition: string,
		public value: number,
		public promotionType: string,
		public productIds: [number]
	) {}
}

export class CreatePromotionUsecaseOutput {
	constructor(public promotionId: number) {}
}

export class CreatePromotionUsecase {
	constructor(
		private readonly productReadAccessor: ProductReadAccessor,
		private readonly promotionRepo: PromotionRepository
	) {}

	async execute(
		input: CreatePromotionUsecaseInput
	): Promise<CreatePromotionUsecaseOutput> {
		const doExist = await this.productReadAccessor.existByIds(
			input.productIds
		);
		if (!doExist) throw Error(`Expect all products to be exist`);

		let promotion = Promotion.create(input as PromotionCreateProps);

		const savedPromotion = await this.promotionRepo.add(promotion);

		return new CreatePromotionUsecaseOutput(savedPromotion.id);
	}
}
