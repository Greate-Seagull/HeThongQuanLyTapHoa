import { prisma } from './../../../composition-root';
import { PromotionReadAccessor } from "../../../infrastructure/read-accessors/prisma/promotion.read-accessor";
import { logger } from "../../../domain/services/logger.service";

export class GetPromotionsUsecase {
	constructor(private readonly promotionRead: PromotionReadAccessor) {}

	async execute() {
		const log = logger.child({ task: "Get all promotions" });
		log.info("Task started");
		const promotions = await this.promotionRead.getAll();
		log.info("Task completed");
		return promotions;
	}
}