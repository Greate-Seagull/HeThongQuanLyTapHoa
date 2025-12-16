import { Prisma, PrismaClient } from "@prisma/client";
import { Stocktaking } from "../../../domain/entities/stocktaking";
import { ChangeTracker } from "../../cache/change-tracker";
import {
	fromPersistence,
	toPersistenceObject,
} from "../../../domain/services/mapper.service";
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
		let persitence = this.toPersistence(entity) as any;
		persitence.stocktakingDetails = {
			connect: persitence.stocktakingDetails,
		};
		return persitence;
	}

	protected buildCreateData(entity: Stocktaking): Partial<StocktakingDto> {
		let persitence = this.toPersistence(entity) as any;
		persitence.stocktakingDetails = {
			create: persitence.stocktakingDetails,
		};
		return persitence;
	}

	protected getBaseQuery(): { select: object } {
		return StocktakingPrismaRepository.baseSelect;
	}

	protected getRepository(transaction?: Prisma.TransactionClient): any {
		if (transaction) return transaction.stocktaking;
		return this.client.stocktaking;
	}

	async findAll(): Promise<Stocktaking[]> {
		const stocktakings = await this.client.stocktaking.findMany({
			include: {
				stocktakingDetails: {
					include: {
						product: true,
						slot: {
							include: {
								rack: {
									include: {
										shelf: true
									}
								}
							}
						}
					}
				},
				employee: true
			},
			orderBy: {
				createdAt: 'desc'
			}
		});

		return stocktakings.map(data => this.fromPersistence(data));
	}

	async getById(id: number): Promise<Stocktaking | null> {
		const stocktaking = await this.client.stocktaking.findUnique({
			where: { id },
			include: {
				stocktakingDetails: {
					include: {
						product: true,
						slot: {
							include: {
								rack: {
									include: {
										shelf: true
									}
								}
							}
						}
					}
				},
				employee: true
			},
		});

		if (!stocktaking) return null;
		return this.fromPersistence(stocktaking) as Stocktaking;
	}
}
