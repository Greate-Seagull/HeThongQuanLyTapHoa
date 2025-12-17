import { Promotion } from "../../../domain/entities/promotion";
import { buildSafePrismaSelect } from "../../../domain/services/query-builder.service";
import { PrismaRepository } from "./prisma.prisma.repository";
import { PromotionDto } from "../../../application/DTOs/promotion.dto";
import { PromotionRepository } from "../../../application/repositories/promotion.repository";
import { Prisma } from "../../../generated/client";

export class PromotionPrismaRepository
	extends PrismaRepository<Promotion, PromotionDto>
	implements PromotionRepository
{
	private static baseSelect = buildSafePrismaSelect(Promotion);

	protected buildUpdateData(entity: Promotion): Partial<PromotionDto> {
		let persitence = this.toPersistence(entity) as any;
		   // Chỉ dùng deleteMany + create, không dùng connect khi update
		   if (Array.isArray(persitence.promotionDetails) && persitence.promotionDetails.length > 0) {
			   persitence.promotionDetails = {
				   deleteMany: {},
				   create: persitence.promotionDetails,
			   };
		   } else {
			   persitence.promotionDetails = {
				   deleteMany: {}
			   };
		   }
		return persitence;
	}

	protected buildCreateData(entity: Promotion): Partial<PromotionDto> {
		let persitence = this.toPersistence(entity) as any;
		persitence.promotionDetails = {
			create: persitence.promotionDetails,
		};
		return persitence;
	}

	protected getBaseQuery(): { select: object } {
		return PromotionPrismaRepository.baseSelect;
	}

	protected getRepository(transaction?: Prisma.TransactionClient): any {
		if (transaction) return transaction.promotion;
		return this.client.promotion;
	}

	async update(promotion: Promotion): Promise<Promotion> {
		return this.save(promotion);
	}

	async delete(id: number): Promise<void> {
		await this.getRepository().delete({ where: { id } });
	}
}
