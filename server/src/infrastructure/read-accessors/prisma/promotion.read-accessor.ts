import { PrismaClient } from "@prisma/client";

export class PromotionReadAccessor {
	constructor(private readonly prisma: PrismaClient) {}

	async getAll() {
		return await this.prisma.promotion.findMany({
			include: {
				promotionDetails: {
					include: {
						product: true
					}
				}
			}
		});
	}
}