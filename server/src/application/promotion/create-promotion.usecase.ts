import z from "zod";
import { Promotion } from "../../domain/promotion";
import { ProductReadAccessor } from "../../infrastructure/read-accessors/product.read-accessor";
import { PromotionRepository } from "../../infrastructure/repositories/promotion.repository";
import { logger } from "../../domain/services/logger.service";

const inputSchema = z.object({
	authId: z.number(),
	name: z.string(),
	description: z.string().optional().nullable(),
	startedAt: z.string().transform((val) => new Date(val)),
	endedAt: z.string().transform((val) => new Date(val)),
	condition: z.string().optional().nullable(),
	value: z.number(),
	promotionType: z.string(),
	promotionDetails: z.array(
		z.object({
			productId: z.number(),
		})
	),
});

const outputSchema = z.object({
	promotionId: z.number(),
});

type CreatePromotionOutput = z.infer<typeof outputSchema>;

export class CreatePromotionUsecase {
	constructor(
		private readonly productReadAccessor: ProductReadAccessor,
		private readonly promotionRepo: PromotionRepository
	) {}

	async execute(input: any): Promise<CreatePromotionOutput> {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Creating promotion",
			employeeId: parsedInput.authId,
		});
		log.info("Task started");

		const productIds = parsedInput.promotionDetails.map((p) => p.productId);
		const doExist = await this.productReadAccessor.existByIds(productIds);
		if (!doExist) {
			log.warn("Task failed: invalid product id");
			throw Error(`Expect all products to be exist`);
		}
		log.debug("Task validated", {
			productIds: productIds,
		});

		const promotion = Promotion.create(parsedInput);

		const savedPromotion = await this.promotionRepo.add(promotion);
		log.debug("Task saved", {
			promotionId: savedPromotion.id,
		});

		log.info("Task completed");
		return outputSchema.parse({ promotionId: savedPromotion.id });
	}
}
