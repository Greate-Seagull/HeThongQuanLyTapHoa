import { PrismaClient } from "@prisma/client";
import { Promotion } from "src/domain/promotion";
import { PromotionMapper } from "../mappers/promotion.mapper";

export class PromotionRepository implements PromotionRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async add(promotion: Promotion): Promise<Promotion> {
		const result = await this.prisma.promotion.create({
			data: PromotionMapper.toPersistence(promotion),
			select: PromotionRepository.baseQuery,
		});

		return PromotionMapper.toDomain(result);
	}

	static baseQuery = {
		id: true,
		name: true,
		description: true,
		startedAt: true,
		endedAt: true,
		condition: true,
		value: true,
		promotionType: true,
		promotionDetails: true,
	};
}
