import { Prisma } from "@prisma/client";
import { Stocktaking } from "../../../domain/entities/stocktaking";
import { buildSafePrismaSelect } from "../../../domain/services/query-builder.service";
import { PrismaRepository } from "./prisma.prisma.repository";
import { StocktakingDto } from "../../../application/DTOs/stocktaking.dto";
import { StocktakingRepository } from "../../../application/repositories/stocktaking.repository";

export class StocktakingPrismaRepository
	extends PrismaRepository<Stocktaking, StocktakingDto>
	implements StocktakingRepository
{
	private static baseSelect = buildSafePrismaSelect(Stocktaking);

	protected buildUpdateData(entity: Stocktaking): Partial<StocktakingDto> {
		const persistence = this.toPersistence(entity) as any;
		
		// Handle stocktakingDetails for update
		if (Array.isArray(persistence.stocktakingDetails)) {
			persistence.stocktakingDetails = {
				deleteMany: {},
				create: persistence.stocktakingDetails,
			};
		}
		
		return persistence;
	}

	protected buildCreateData(entity: Stocktaking): Partial<StocktakingDto> {
		const persistence = this.toPersistence(entity) as any;
		
		// Handle stocktakingDetails for create
		persistence.stocktakingDetails = {
			create: persistence.stocktakingDetails,
		};
		
		return persistence;
	}

	protected getBaseQuery(): { select: object } {
		return StocktakingPrismaRepository.baseSelect;
	}

	protected getRepository(transaction?: Prisma.TransactionClient): any {
		if (transaction) return transaction.stocktaking;
		return this.client.stocktaking;
	}

	// Custom methods for StocktakingRepository interface
	async update(
		id: number,
		employeeId: number,
		details: any[]
	): Promise<Stocktaking> {
		// Delete old details
		await this.client.stocktakingDetail.deleteMany({
			where: { stocktakingId: id },
		});

		// Update with new details
		const updated = await this.getRepository().update({
			where: { id },
			data: {
				employeeId,
				stocktakingDetails: {
					create: details.map((detail) => ({
						productId: detail.productId!,
						slotId: detail.slotId,
						status: detail.status,
						quantity: detail.quantity,
					})),
				},
			},
			...this.getBaseQuery(),
		});

		return this.fromPersistence(updated);
	}

	async delete(id: number): Promise<void> {
		await this.getRepository().delete({
			where: { id },
		});
	}
}
