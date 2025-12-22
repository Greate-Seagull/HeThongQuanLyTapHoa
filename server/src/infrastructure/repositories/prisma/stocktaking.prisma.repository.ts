import { Prisma } from "@prisma/client";
import { Stocktaking } from "../../../domain/entities/stocktaking";
import { buildSafePrismaSelect } from "../../../domain/services/query-builder.service";
import { StocktakingRepository } from "../../../application/repositories/stocktaking.repository";
import { StocktakingDto } from "../../../application/DTOs/stocktaking.dto";
import { PrismaRepository } from "./prisma.prisma.repository";

export class StocktakingPrismaRepository
	extends PrismaRepository<Stocktaking, StocktakingDto>
	implements StocktakingRepository
{
	private static baseSelect = buildSafePrismaSelect(Stocktaking);

	protected buildUpdateData(entity: Stocktaking): Partial<StocktakingDto> {
		const persistence = this.toPersistence(entity) as any;
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

	async add(entity: Stocktaking, transaction?: Prisma.TransactionClient): Promise<Stocktaking> {
		const prismaClient = transaction || this.client;
		
		// ✅ CRITICAL FIX: Handle both entity objects and plain objects
		let data: any;
		
		if ((entity as any).employeeId && (entity as any).stocktakingDetails) {
			// ✅ Plain object from usecase - use directly
			console.log('📦 Repository: Using plain object data');
			data = {
				employeeId: (entity as any).employeeId,
				createdAt: (entity as any).createdAt || new Date(),  // ✅ Fallback to now()
				stocktakingDetails: {
					create: (entity as any).stocktakingDetails.map((d: any) => ({
						productId: d.productId,
						slotId: d.slotId,
						status: d.status,
						quantity: d.quantity,
					})),
				},
			};
		} else {
			// ✅ Entity object - use buildCreateData
			console.log('📦 Repository: Using entity toPersistence');
			data = this.buildCreateData(entity);
		}
		
		console.log('📦 Final data to save:', {
			employeeId: data.employeeId,
			createdAt: data.createdAt,
			createdAtType: typeof data.createdAt,
			detailsCount: data.stocktakingDetails?.create?.length || 0,
		});
		
		const raw = await prismaClient.stocktaking.create({
			data: data,
			include: {
				stocktakingDetails: true,
			},
		});

		return this.manuallyConstructEntity(raw);
	}

	async getById(id: number): Promise<Stocktaking | null> {
		const raw = await this.client.stocktaking.findUnique({
			where: { id },
			include: {
				stocktakingDetails: true,
			},
		});

		if (!raw) return null;
		return this.manuallyConstructEntity(raw as any);
	}

	private manuallyConstructEntity(raw: any): Stocktaking {
		const entity = Object.create(Stocktaking.prototype);
		
		(entity as any)._id = raw.id;
		(entity as any)._employeeId = raw.employeeId;
		(entity as any)._createdAt = raw.createdAt;
		
		const details = (raw.stocktakingDetails || []).map((detailRaw: any) => {
			const detail: any = {};
			detail._id = detailRaw.id;
			detail._stocktakingId = detailRaw.stocktakingId;
			detail._productId = detailRaw.productId;
			detail._slotId = detailRaw.slotId;
			detail._status = detailRaw.status;
			detail._quantity = detailRaw.quantity;
			
			Object.defineProperty(detail, 'id', { get() { return this._id; }, enumerable: true });
			Object.defineProperty(detail, 'stocktakingId', { get() { return this._stocktakingId; }, enumerable: true });
			Object.defineProperty(detail, 'productId', { get() { return this._productId; }, enumerable: true });
			Object.defineProperty(detail, 'slotId', { get() { return this._slotId; }, enumerable: true });
			Object.defineProperty(detail, 'status', { get() { return this._status; }, enumerable: true });
			Object.defineProperty(detail, 'quantity', { get() { return this._quantity; }, enumerable: true });
			
			return detail;
		});
		
		(entity as any)._stocktakingDetails = details;
		return entity;
	}

	async update(
		id: number,
		employeeId: number,
		details: any[],
		transaction?: Prisma.TransactionClient
	): Promise<Stocktaking> {
		const prismaClient = transaction || this.client;
		
		await prismaClient.stocktakingDetail.deleteMany({
			where: { stocktakingId: id },
		});

		const updated = await prismaClient.stocktaking.update({
			where: { id },
			data: {
				employeeId,
				stocktakingDetails: {
					create: details.map((detail) => ({
						productId: detail.productId,
						slotId: detail.slotId,
						status: detail.status,
						quantity: detail.quantity,
					})),
				},
			},
			include: {
				stocktakingDetails: true,
			},
		});
		
		return this.manuallyConstructEntity(updated);
	}

	async delete(id: number, transaction?: Prisma.TransactionClient): Promise<void> {
		const prismaClient = transaction || this.client;
		
		await prismaClient.stocktaking.delete({
			where: { id },
		});
	}
}
